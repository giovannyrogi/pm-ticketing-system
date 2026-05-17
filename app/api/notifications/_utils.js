import { cookies } from "next/headers";

/**
 * Membaca cookie user aktif dari request API.
 * Helper ini menjaga setiap endpoint notifikasi hanya bekerja untuk session valid.
 */
export const getAuthenticatedUser = async () => {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("dataUser");

  if (!userCookie) {
    return { user: null, error: "Unauthorized" };
  }

  try {
    const user = JSON.parse(userCookie.value);

    if (user?.expiresAt && user.expiresAt < Date.now()) {
      return { user: null, error: "Session expired" };
    }

    return { user, error: null };
  } catch {
    return { user: null, error: "Invalid session" };
  }
};

/**
 * Mengambil seluruh akun staff aktif yang perlu menerima notifikasi operasional.
 * Saat tiket baru dibuat, admin dan superadmin sama-sama perlu tahu ada antrean baru.
 */
export const getActiveStaffUserIds = async (client, excludedUserIds = []) => {
  const excludedIds = excludedUserIds.map(Number).filter(Boolean);

  const result = await client.query(
    `
      SELECT id
      FROM users
      WHERE role IN ('admin', 'superadmin')
      AND is_active = TRUE
      AND NOT (id = ANY($1::int[]))
    `,
    [excludedIds],
  );

  return result.rows.map((row) => row.id);
};

/**
 * Mengambil akun superadmin aktif sebagai penerima notifikasi pengawasan.
 * Actor bisa dikecualikan agar user yang melakukan aksi tidak menerima notif dari aksinya sendiri.
 */
export const getActiveSuperadminUserIds = async (
  client,
  excludedUserIds = [],
) => {
  const excludedIds = excludedUserIds.map(Number).filter(Boolean);

  const result = await client.query(
    `
      SELECT id
      FROM users
      WHERE role = 'superadmin'
      AND is_active = TRUE
      AND NOT (id = ANY($1::int[]))
    `,
    [excludedIds],
  );

  return result.rows.map((row) => row.id);
};

/**
 * Menyimpan satu notifikasi dengan payload metadata yang selalu aman untuk JSONB.
 * Fungsi ini menerima client transaksi agar notifikasi ikut rollback jika event utama gagal.
 */
export const createNotification = async (
  client,
  { userId, ticketId = null, type, title, message, metadata = {} },
) => {
  if (!userId || !type || !title || !message) return;

  await client.query(
    `
      INSERT INTO notifications (
        user_id,
        ticket_id,
        type,
        title,
        message,
        metadata,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW())
    `,
    [
      userId,
      ticketId,
      type,
      title,
      message,
      JSON.stringify(metadata || {}),
    ],
  );
};

/**
 * Menyimpan notifikasi untuk banyak user sekaligus.
 * Duplikasi user dibersihkan agar satu orang tidak menerima notifikasi yang sama dua kali.
 */
export const createNotificationsForUsers = async (
  client,
  userIds,
  notification,
) => {
  const uniqueUserIds = [...new Set((userIds || []).filter(Boolean))];

  for (const userId of uniqueUserIds) {
    await createNotification(client, {
      ...notification,
      userId,
    });
  }
};
