import formatTimeAgo from "@/app/utils/formatTime";
import pool from "@/lib/dbConfig";
import { cookies } from "next/headers";

export async function GET(req, { params }) {
  const client = await pool.connect();

  try {
    const { id } = await params;

    /**
     * ===============================
     * VALIDASI ID
     * ===============================
     */
    if (!id || isNaN(Number(id))) {
      return Response.json(
        { success: false, message: "Invalid ID" },
        { status: 400 },
      );
    }

    /**
     * ===============================
     * AUTH
     * ===============================
     */
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("dataUser");

    if (!userCookie) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    let user;

    try {
      user = JSON.parse(userCookie.value);
    } catch {
      return Response.json(
        { success: false, message: "Invalid session" },
        { status: 401 },
      );
    }

    /**
     * ===============================
     * ROLE CHECK
     * ===============================
     */
    const isAdmin = ["admin", "superadmin"].includes(user.role);

    /**
     * ===============================
     * QUERY DETAIL TICKET
     * ===============================
     */
    const baseQuery = `
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
        t.last_reply_role,
        t.waiting_reply_from,
        t.created_by,

        -- user
        u.id as user_id,
        u.full_name as user_name,

        -- admin
        a.id as admin_id,
        a.full_name as admin_name,

        -- category
        c.id as category_id,
        c.category_name,

        -- location
        l.id as location_id,
        l.location_name,

        -- attachment ticket
        att.image_url,

        -- stats
        ts.views_count,
        ts.likes_count,

        -- last message
        (
          SELECT tm.message
          FROM ticket_messages tm
          WHERE tm.ticket_id = t.id
          ORDER BY tm.created_at DESC
          LIMIT 1
        ) as last_message

      FROM tickets t

      LEFT JOIN users u
        ON t.created_by = u.id

      LEFT JOIN users a
        ON t.assigned_to = a.id

      LEFT JOIN categories c
        ON t.category_id = c.id

      LEFT JOIN locations l
        ON t.location_id = l.id

      LEFT JOIN attachments att
        ON att.ticket_id = t.id
        AND att.message_id IS NULL

      LEFT JOIN ticket_stats ts
        ON ts.ticket_id = t.id
    `;

    let query = "";
    let values = [];

    if (isAdmin) {
      query = `${baseQuery} WHERE t.id = $1`;
      values = [id];
    } else {
      query = `
        ${baseQuery}
        WHERE t.id = $1
        AND t.created_by = $2
      `;

      values = [id, user.id];
    }

    const result = await client.query(query, values);

    /**
     * ===============================
     * NOT FOUND
     * ===============================
     */
    if (result.rowCount === 0) {
      return Response.json(
        {
          success: false,
          message: "Ticket tidak ditemukan",
        },
        { status: 404 },
      );
    }

    const row = result.rows[0];

    /**
     * ===============================
     * GET TICKET MESSAGES
     * ===============================
     */
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

    /**
     * ===============================
     * GROUPING MESSAGE IMAGES
     * ===============================
     */
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

    const messages = Object.values(messageMap);

    /**
     * ===============================
     * GROUPING TICKET IMAGES
     * ===============================
     */
    const images = result.rows.map((r) => r.image_url).filter(Boolean);

    /**
     * ===============================
     * RESPONSE
     * ===============================
     */
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

      last_reply_role: row.last_reply_role,

      waiting_reply_from: row.waiting_reply_from,

      user: {
        id: row.user_id,
        name: row.user_name,
      },

      admin: row.admin_id
        ? {
            id: row.admin_id,
            name: row.admin_name,
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
      },

      last_message: row.last_message || null,

      images,

      messages,
    };

    return Response.json({
      success: true,
      message: "Berhasil mengambil detail ticket",
      data,
    });
  } catch (err) {
    console.error("ERROR GET DETAIL:", err);

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
