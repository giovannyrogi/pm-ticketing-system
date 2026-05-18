import pool from "@/lib/dbConfig";
import { cookies } from "next/headers";

const ADMIN_ROLES = ["admin", "superadmin"];

// Daftar periode trend yang diizinkan agar query tetap aman dan tidak menerima SQL bebas dari client.
const TREND_PERIODS = {
  week: {
    label: "Minggu Ini",
    start: "date_trunc('week', CURRENT_DATE)::date",
    end: "(date_trunc('week', CURRENT_DATE) + INTERVAL '6 days')::date",
    step: "1 day",
    bucketFormat: "YYYY-MM-DD",
  },
  month: {
    label: "Bulan Ini",
    start: "date_trunc('month', CURRENT_DATE)::date",
    end: "(date_trunc('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date",
    step: "1 day",
    bucketFormat: "YYYY-MM-DD",
  },
  year: {
    label: "Tahun Ini",
    start: "date_trunc('year', CURRENT_DATE)::date",
    end: "(date_trunc('year', CURRENT_DATE) + INTERVAL '11 months')::date",
    step: "1 month",
    bucketFormat: "YYYY-MM",
  },
};

const DAY_NAMES = {
  short: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
  long: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
};

const MONTH_NAMES = {
  short: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ],
  long: [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ],
};

// Normalisasi angka dari PostgreSQL karena hasil COUNT sering kembali sebagai string.
const toNumber = (value) => Number(value || 0);

// Hitung perubahan persentase bulan ini dibanding bulan lalu untuk card total laporan.
const getPercentChange = (current, previous) => {
  const currentValue = toNumber(current);
  const previousValue = toNumber(previous);

  if (previousValue === 0) {
    return null;
  }

  return Number(
    (((currentValue - previousValue) / previousValue) * 100).toFixed(1),
  );
};

const parseTrendDate = (bucket, period) => {
  const [year, month, day = "01"] = bucket.split("-").map(Number);

  return new Date(year, month - 1, period === "year" ? 1 : day);
};

const formatTrendLabel = (bucket, period) => {
  const date = parseTrendDate(bucket, period);
  const day = String(date.getDate()).padStart(2, "0");
  const monthShort = MONTH_NAMES.short[date.getMonth()];
  const monthLong = MONTH_NAMES.long[date.getMonth()];
  const year = date.getFullYear();

  if (period === "week") {
    return {
      label: DAY_NAMES.short[date.getDay()],
      tooltip_label: `${DAY_NAMES.long[date.getDay()]}, ${day} ${monthLong} ${year}`,
    };
  }

  if (period === "month") {
    return {
      label: `${day} ${monthShort}`,
      tooltip_label: `${DAY_NAMES.long[date.getDay()]}, ${day} ${monthLong} ${year}`,
    };
  }

  return {
    label: monthShort,
    tooltip_label: `${monthLong} ${year}`,
  };
};

// Membuat query trend dari konfigurasi periode yang sudah di-whitelist.
const buildTrendQuery = (trendConfig) => `
  SELECT
    bucket::date as date,
    TO_CHAR(bucket, '${trendConfig.bucketFormat}') as bucket,
    (
      SELECT COUNT(*)
      FROM tickets t
      WHERE t.created_at >= bucket
      AND t.created_at < bucket + INTERVAL '${trendConfig.step}'
    ) as created,
    (
      SELECT COUNT(*)
      FROM tickets t
      WHERE t.completed_at >= bucket
      AND t.completed_at < bucket + INTERVAL '${trendConfig.step}'
    ) as completed
  FROM generate_series(
    ${trendConfig.start},
    ${trendConfig.end},
    INTERVAL '${trendConfig.step}'
  ) as bucket
  ORDER BY bucket ASC
`;

// Format hasil query trend agar struktur response konsisten untuk semua periode.
const mapTrendRows = (rows, period) =>
  rows.map((item) => {
    const label = formatTrendLabel(item.bucket, period);

    return {
      date: item.date,
      bucket: item.bucket,
      label: label.label,
      tooltip_label: label.tooltip_label,
      created: toNumber(item.created),
      completed: toNumber(item.completed),
    };
  });

// Ambil dan validasi session user dari cookie yang dipakai aplikasi.
const getUserFromCookie = async () => {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("dataUser");

  if (!userCookie) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const user = JSON.parse(userCookie.value);

    if (user?.expiresAt && user.expiresAt < Date.now()) {
      return { error: "Session expired", status: 401 };
    }

    return { user };
  } catch {
    return { error: "Invalid session", status: 401 };
  }
};

// Pastikan hanya admin/superadmin aktif yang bisa mengakses endpoint dashboard.
const validateActiveAdmin = async (client, user) => {
  if (!ADMIN_ROLES.includes(user?.role)) {
    return { error: "Forbidden", status: 403 };
  }

  const userResult = await client.query(
    `
      SELECT id, full_name, role, is_active
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [user.id],
  );

  if (userResult.rowCount === 0 || !userResult.rows[0].is_active) {
    return { error: "User tidak aktif", status: 403 };
  }

  if (!ADMIN_ROLES.includes(userResult.rows[0].role)) {
    return { error: "Forbidden", status: 403 };
  }

  return { user: userResult.rows[0] };
};

export async function GET() {
  const client = await pool.connect();

  try {
    // Validasi session sebelum menjalankan query dashboard.
    const session = await getUserFromCookie();

    if (session.error) {
      return Response.json(
        { success: false, message: session.error },
        { status: session.status },
      );
    }

    const auth = await validateActiveAdmin(client, session.user);

    if (auth.error) {
      return Response.json(
        { success: false, message: auth.error },
        { status: auth.status },
      );
    }

    // Semua query dashboard dijalankan paralel karena masing-masing query bersifat read-only dan independen.
    const [
      overviewResult,
      monthlyResult,
      weekTrendResult,
      monthTrendResult,
      yearTrendResult,
      categoryResult,
      locationResult,
      adminWorkloadResult,
      recentTicketsResult,
      engagementResult,
      waitingReplyResult,
      userSummaryResult,
    ] = await Promise.all([
      // Ringkasan global untuk status, rating, publikasi, dan tiket milik admin yang sedang login.
      client.query(
        `
          SELECT
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'pending') as pending,
            COUNT(*) FILTER (WHERE status = 'proses') as proses,
            COUNT(*) FILTER (WHERE status = 'selesai') as selesai,
            COUNT(*) FILTER (WHERE status = 'ditolak') as ditolak,
            COUNT(*) FILTER (WHERE status = 'pending' AND assigned_to IS NULL) as unassigned,
            COUNT(*) FILTER (WHERE status = 'proses' AND assigned_to = $1) as assigned_to_me,
            COUNT(*) FILTER (WHERE status = 'selesai' AND is_public = TRUE) as public_tickets,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_last_7_days,
            COUNT(*) FILTER (WHERE completed_at >= CURRENT_DATE - INTERVAL '7 days') as completed_last_7_days,
            COUNT(rating_value) as rating_count,
            COALESCE(ROUND(AVG(rating_value)::numeric, 2), 0) as average_rating
          FROM tickets
        `,
        [auth.user.id],
      ),
      // Data khusus card total laporan: bulan berjalan dibanding satu bulan sebelumnya.
      client.query(
        `
          WITH month_bounds AS (
            SELECT
              date_trunc('month', CURRENT_DATE)::date as current_start,
              (date_trunc('month', CURRENT_DATE) - INTERVAL '1 month')::date as previous_start
          )
          SELECT
            COUNT(*) FILTER (
              WHERE t.created_at >= mb.current_start
            ) as total_current,
            COUNT(*) FILTER (
              WHERE t.created_at >= mb.previous_start
              AND t.created_at < mb.current_start
            ) as total_previous
          FROM tickets t
          CROSS JOIN month_bounds mb
        `,
      ),
      // Series chart minggu ini, disiapkan sejak awal agar filter UI tidak perlu hit endpoint lagi.
      client.query(buildTrendQuery(TREND_PERIODS.week)),
      // Series chart bulan ini, disiapkan sejak awal agar filter UI cukup memakai data lokal.
      client.query(buildTrendQuery(TREND_PERIODS.month)),
      // Series chart tahun ini, memakai bucket bulanan agar data tahunan tetap ringan.
      client.query(buildTrendQuery(TREND_PERIODS.year)),
      // Kategori dengan volume laporan tertinggi, dibatasi agar dashboard tetap ringan.
      client.query(
        `
          SELECT
            c.id,
            c.category_name as name,
            COUNT(t.id) as total,
            COUNT(t.id) FILTER (WHERE t.status = 'proses') as active
          FROM categories c
          LEFT JOIN tickets t
            ON t.category_id = c.id
          GROUP BY c.id, c.category_name
          ORDER BY total DESC, c.category_name ASC
          LIMIT 6
        `,
      ),
      // Lokasi dengan volume laporan tertinggi, dibatasi agar dashboard tetap ringan.
      client.query(
        `
          SELECT
            l.id,
            l.location_name as name,
            COUNT(t.id) as total,
            COUNT(t.id) FILTER (WHERE t.status IN ('pending', 'proses')) as active
          FROM locations l
          LEFT JOIN tickets t
            ON t.location_id = l.id
          GROUP BY l.id, l.location_name
          ORDER BY total DESC, l.location_name ASC
          LIMIT 6
        `,
      ),
      // Beban kerja admin aktif: tiket proses, selesai, dan rata-rata rating tiket yang ditangani.
      client.query(
        `
          SELECT
            u.id,
            u.full_name as name,
            u.role,
            COUNT(t.id) FILTER (WHERE t.status = 'proses') as active_tickets,
            COUNT(t.id) FILTER (WHERE t.status = 'selesai') as completed_tickets,
            COALESCE(ROUND(AVG(t.rating_value)::numeric, 2), 0) as average_rating
          FROM users u
          LEFT JOIN tickets t
            ON t.assigned_to = u.id
          WHERE u.role IN ('admin', 'superadmin')
          AND u.is_active = TRUE
          GROUP BY u.id, u.full_name, u.role
          ORDER BY active_tickets DESC, completed_tickets DESC, u.full_name ASC
          LIMIT 6
        `,
      ),
      // Tiket terbaru untuk tabel monitoring cepat tanpa mengambil seluruh data tiket.
      client.query(
        `
          SELECT
            t.id,
            t.ticket_code,
            t.ticket_title,
            t.status,
            t.priority,
            t.created_at,
            t.updated_at,
            u.full_name as user_name,
            a.full_name as admin_name,
            c.category_name,
            l.location_name
          FROM tickets t
          LEFT JOIN users u
            ON t.created_by = u.id
          LEFT JOIN users a
            ON t.assigned_to = a.id
          LEFT JOIN categories c
            ON t.category_id = c.id
          LEFT JOIN locations l
            ON t.location_id = l.id
          ORDER BY t.created_at DESC
          LIMIT 8
        `,
      ),
      // Statistik engagement hanya untuk tiket selesai yang sudah dipublikasikan.
      client.query(
        `
          SELECT
            COALESCE(SUM(ts.views_count), 0) as views,
            COALESCE(SUM(ts.likes_count), 0) as likes,
            COALESCE(ROUND(AVG(ts.views_count)::numeric, 2), 0) as average_views
          FROM tickets t
          LEFT JOIN ticket_stats ts
            ON ts.ticket_id = t.id
          WHERE t.status = 'selesai'
          AND t.is_public = TRUE
        `,
      ),
      // Jumlah tiket proses yang sedang menunggu balasan admin atau user.
      client.query(
        `
          SELECT
            COUNT(*) FILTER (WHERE waiting_reply_from = 'admin' AND status = 'proses') as waiting_admin,
            COUNT(*) FILTER (WHERE waiting_reply_from = 'user' AND status = 'proses') as waiting_user
          FROM tickets
        `,
      ),
      // Ringkasan user hanya dibutuhkan oleh superadmin, admin biasa tidak menjalankan query ini.
      auth.user.role === "superadmin"
        ? client.query(
            `
              SELECT
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE is_active = TRUE) as active,
                COUNT(*) FILTER (WHERE role = 'user') as users,
                COUNT(*) FILTER (WHERE role IN ('admin', 'superadmin')) as admins
              FROM users
            `,
          )
        : Promise.resolve({ rows: [] }),
    ]);

    const overview = overviewResult.rows[0];
    const monthly = monthlyResult.rows[0];
    const engagement = engagementResult.rows[0];
    const waitingReply = waitingReplyResult.rows[0];
    const userSummary = userSummaryResult.rows[0] || null;

    return Response.json({
      success: true,
      message: "Berhasil mengambil ringkasan dashboard",
      data: {
        current_user: {
          id: auth.user.id,
          name: auth.user.full_name,
          role: auth.user.role,
        },
        overview: {
          total: toNumber(overview.total),
          pending: toNumber(overview.pending),
          proses: toNumber(overview.proses),
          selesai: toNumber(overview.selesai),
          ditolak: toNumber(overview.ditolak),
          unassigned: toNumber(overview.unassigned),
          assigned_to_me: toNumber(overview.assigned_to_me),
          public_tickets: toNumber(overview.public_tickets),
          new_last_7_days: toNumber(overview.new_last_7_days),
          completed_last_7_days: toNumber(overview.completed_last_7_days),
          rating_count: toNumber(overview.rating_count),
          average_rating: toNumber(overview.average_rating),
        },
        monthly: {
          // Perbandingan hanya dipakai card Total Laporan di UI.
          total: {
            current: toNumber(monthly.total_current),
            previous: toNumber(monthly.total_previous),
            percentage: getPercentChange(monthly.total_current, monthly.total_previous),
          },
        },
        waiting_reply: {
          admin: toNumber(waitingReply.waiting_admin),
          user: toNumber(waitingReply.waiting_user),
        },
        engagement: {
          views: toNumber(engagement.views),
          likes: toNumber(engagement.likes),
          average_views: toNumber(engagement.average_views),
        },
        users: userSummary
          ? {
              total: toNumber(userSummary.total),
              active: toNumber(userSummary.active),
              users: toNumber(userSummary.users),
              admins: toNumber(userSummary.admins),
            }
          : null,
        trend: {
          week: {
            period: "week",
            label: TREND_PERIODS.week.label,
            items: mapTrendRows(weekTrendResult.rows, "week"),
          },
          month: {
            period: "month",
            label: TREND_PERIODS.month.label,
            items: mapTrendRows(monthTrendResult.rows, "month"),
          },
          year: {
            period: "year",
            label: TREND_PERIODS.year.label,
            items: mapTrendRows(yearTrendResult.rows, "year"),
          },
        },
        categories: categoryResult.rows.map((item) => ({
          id: item.id,
          name: item.name,
          total: toNumber(item.total),
          active: toNumber(item.active),
        })),
        locations: locationResult.rows.map((item) => ({
          id: item.id,
          name: item.name,
          total: toNumber(item.total),
          active: toNumber(item.active),
        })),
        admin_workload: adminWorkloadResult.rows.map((item) => ({
          id: item.id,
          name: item.name,
          role: item.role,
          active_tickets: toNumber(item.active_tickets),
          completed_tickets: toNumber(item.completed_tickets),
          average_rating: toNumber(item.average_rating),
        })),
        recent_tickets: recentTicketsResult.rows.map((item) => ({
          id: item.id,
          ticket_code: item.ticket_code,
          ticket_title: item.ticket_title,
          status: item.status,
          priority: item.priority,
          created_at: item.created_at,
          updated_at: item.updated_at,
          user_name: item.user_name,
          admin_name: item.admin_name,
          category_name: item.category_name,
          location_name: item.location_name,
        })),
      },
    });
  } catch (err) {
    console.error("ERROR DASHBOARD SUMMARY:", err);

    return Response.json(
      {
        success: false,
        message: err.message || "Internal server error",
      },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
