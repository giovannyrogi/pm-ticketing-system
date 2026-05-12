import formatTimeAgo from "@/app/utils/formatTime";
import pool from "@/lib/dbConfig";
import { cookies } from "next/headers";

export async function GET(req, { params }) {
  const client = await pool.connect();

  try {
    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return Response.json(
        { success: false, message: "ID ticket tidak valid" },
        { status: 400 },
      );
    }

    await client.query("BEGIN");

    const result = await client.query(
      `
        SELECT
          t.id,
          t.ticket_code,
          t.ticket_title,
          t.ticket_description,
          t.status,
          t.priority,
          t.created_at,
          t.updated_at,
          t.assigned_to,
          t.created_by,
          t.is_public,
          t.published_at,
          t.completed_at,
          t.completed_by,
          t.rating_value,
          t.rating_comment,
          t.rated_by,
          t.rated_at,

          u.id as user_id,
          u.full_name as user_name,
          u.role as user_role,

          a.id as admin_id,
          a.full_name as admin_name,
          a.role as admin_role,

          ca.id as completed_admin_id,
          ca.full_name as completed_admin_name,

          c.id as category_id,
          c.category_name,

          l.id as location_id,
          l.location_name,

          att.image_url,

          ts.views_count,
          ts.likes_count

        FROM tickets t

        LEFT JOIN users u
          ON t.created_by = u.id

        LEFT JOIN users a
          ON t.assigned_to = a.id

        LEFT JOIN users ca
          ON t.completed_by = ca.id

        LEFT JOIN categories c
          ON t.category_id = c.id

        LEFT JOIN locations l
          ON t.location_id = l.id

        LEFT JOIN attachments att
          ON att.ticket_id = t.id
          AND att.message_id IS NULL

        LEFT JOIN ticket_stats ts
          ON ts.ticket_id = t.id

        WHERE t.id = $1
        AND t.is_public = TRUE
        AND t.status = 'selesai'
      `,
      [id],
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");

      return Response.json(
        {
          success: false,
          message: "Ticket publik tidak ditemukan",
        },
        { status: 404 },
      );
    }

    const row = result.rows[0];

    const messageResult = await client.query(
      `
        SELECT
          tm.id,
          tm.ticket_id,
          tm.sender_id,
          tm.sender_role,
          tm.message,
          tm.created_at,

          u.full_name as sender_name,

          att.image_url

        FROM ticket_messages tm

        LEFT JOIN users u
          ON tm.sender_id = u.id

        LEFT JOIN attachments att
          ON att.message_id = tm.id

        WHERE tm.ticket_id = $1

        ORDER BY tm.created_at ASC
      `,
      [id],
    );

    await client.query("COMMIT");

    const messageMap = {};

    messageResult.rows.forEach((msg) => {
      if (!messageMap[msg.id]) {
        messageMap[msg.id] = {
          id: msg.id,
          sender_id: msg.sender_id,
          sender_role: msg.sender_role,
          sender_name: msg.sender_name,
          message: msg.message,
          created_at: msg.created_at,
          created_at_human: formatTimeAgo(msg.created_at),
          images: [],
        };
      }

      if (msg.image_url) {
        messageMap[msg.id].images.push(msg.image_url);
      }
    });

    /**
     * ===============================
     * GET USER
     * ===============================
     */
    const cookieStore = await cookies();

    const userCookie = cookieStore.get("dataUser");

    let currentUserId = null;

    if (userCookie) {
      try {
        const user = JSON.parse(userCookie.value);

        currentUserId = user.id;
      } catch {}
    }

    /**
     * ===============================
     * CHECK USER LIKE
     * ===============================
     */
    let isLiked = false;

    if (currentUserId) {
      const likeResult = await client.query(
        `
      SELECT id
      FROM ticket_likes
      WHERE ticket_id = $1
      AND user_id = $2
      LIMIT 1
    `,
        [id, currentUserId],
      );

      isLiked = likeResult.rowCount > 0;
    }

    const data = {
      id: row.id,
      ticket_code: row.ticket_code,
      ticket_title: row.ticket_title,
      ticket_description: row.ticket_description,
      status: row.status,
      priority: row.priority,
      created_at: row.created_at,
      created_at_human: formatTimeAgo(row.created_at),
      updated_at: row.updated_at,
      assigned_to: row.assigned_to,
      is_public: row.is_public,
      published_at: row.published_at,
      published_at_human: row.published_at
        ? formatTimeAgo(row.published_at)
        : null,
      completed_at: row.completed_at,
      completed_at_human: row.completed_at
        ? formatTimeAgo(row.completed_at)
        : null,
      completed_by: row.completed_by,
      completed_by_name: row.completed_admin_name || null,
      rating_value: row.rating_value,
      rating_comment: row.rating_comment,
      rated_by: row.rated_by,
      rated_at_human: row.rated_at ? formatTimeAgo(row.rated_at) : null,
      user: {
        id: row.user_id,
        name: row.user_name,
        role: row.user_role,
      },
      admin: row.admin_id
        ? {
            id: row.admin_id,
            name: row.admin_name,
            role: row.admin_role,
          }
        : null,
      category: {
        id: row.category_id,
        name: row.category_name,
      },
      location: {
        id: row.location_id,
        name: row.location_name,
      },
      stats: {
        views: row.views_count || 0,
        likes: row.likes_count || 0,
        liked: isLiked,
      },
      images: result.rows.map((r) => r.image_url).filter(Boolean),
      messages: Object.values(messageMap),
    };

    return Response.json({
      success: true,
      message: "Berhasil mengambil detail tiket publik",
      data,
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("ERROR GET PUBLIC TICKET DETAIL:", err);

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
