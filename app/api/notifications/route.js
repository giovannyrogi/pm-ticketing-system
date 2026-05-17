import pool from "@/lib/dbConfig";
import formatTimeAgo from "@/app/utils/formatTime";
import { getAuthenticatedUser } from "./_utils";

/**
 * GET /api/notifications
 * Mengambil notifikasi milik user yang sedang login beserta total unread.
 */
export async function GET(req) {
  const client = await pool.connect();

  try {
    const { user, error } = await getAuthenticatedUser();

    if (!user) {
      return Response.json(
        { success: false, message: error || "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const limitParam = Number(searchParams.get("limit") || 10);
    const limit = Number.isInteger(limitParam)
      ? Math.min(Math.max(limitParam, 1), 30)
      : 10;

    const result = await client.query(
      `
        SELECT
          n.id,
          n.user_id,
          n.ticket_id,
          n.type,
          n.title,
          n.message,
          n.is_read,
          n.metadata,
          n.read_at,
          n.created_at,
          t.ticket_code
        FROM notifications n
        LEFT JOIN tickets t ON t.id = n.ticket_id
        WHERE n.user_id = $1
        ORDER BY n.created_at DESC
        LIMIT $2
      `,
      [user.id, limit],
    );

    const unreadResult = await client.query(
      `
        SELECT COUNT(*)::int AS total
        FROM notifications
        WHERE user_id = $1
        AND is_read = FALSE
      `,
      [user.id],
    );

    const data = result.rows.map((item) => ({
      ...item,
      created_at_human: formatTimeAgo(item.created_at),
    }));

    return Response.json({
      success: true,
      message: "Notifikasi berhasil diambil",
      data,
      unread_count: unreadResult.rows[0]?.total || 0,
    });
  } catch (err) {
    console.error("ERROR GET NOTIFICATIONS:", err);

    return Response.json(
      {
        success: false,
        message: err.message || "Gagal mengambil notifikasi",
      },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}

/**
 * PATCH /api/notifications
 * Menandai satu notifikasi atau semua notifikasi user login sebagai sudah dibaca.
 */
export async function PATCH(req) {
  const client = await pool.connect();

  try {
    const { user, error } = await getAuthenticatedUser();

    if (!user) {
      return Response.json(
        { success: false, message: error || "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const markAll = Boolean(body.mark_all);
    const notificationId = Number(body.notification_id);

    if (!markAll && (!notificationId || isNaN(notificationId))) {
      return Response.json(
        { success: false, message: "ID notifikasi tidak valid" },
        { status: 400 },
      );
    }

    if (markAll) {
      await client.query(
        `
          UPDATE notifications
          SET is_read = TRUE,
              read_at = COALESCE(read_at, NOW())
          WHERE user_id = $1
          AND is_read = FALSE
        `,
        [user.id],
      );
    } else {
      await client.query(
        `
          UPDATE notifications
          SET is_read = TRUE,
              read_at = COALESCE(read_at, NOW())
          WHERE id = $1
          AND user_id = $2
        `,
        [notificationId, user.id],
      );
    }

    return Response.json({
      success: true,
      message: "Notifikasi diperbarui",
    });
  } catch (err) {
    console.error("ERROR UPDATE NOTIFICATIONS:", err);

    return Response.json(
      {
        success: false,
        message: err.message || "Gagal memperbarui notifikasi",
      },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
