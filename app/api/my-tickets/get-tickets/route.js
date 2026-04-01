import pool from "@/lib/dbConfig";
import moment from "moment";

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const query = `
      SELECT 
        t.id,
        t.ticket_code,
        t.ticket_title,
        t.ticket_description,
        t.status,
        t.priority,
        t.is_public,
        t.published_at,
        t.closed_at,
        t.created_at,
        t.updated_at,

        -- user (pelapor)
        u.id as user_id,
        u.full_name as user_name,
        u.username as user_username,

        -- admin (assigned)
        a.id as admin_id,
        a.full_name as admin_name,

        -- location
        l.id as location_id,
        l.location_name,
        l.address,

        -- category
        c.id as category_id,
        c.category_name,

        -- stats
        ts.views_count,
        ts.likes_count,

        -- last message (optional)
        (
          SELECT tm.message 
          FROM ticket_messages tm
          WHERE tm.ticket_id = t.id
          ORDER BY tm.created_at DESC
          LIMIT 1
        ) as last_message

      FROM tickets t
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN users a ON t.assigned_to = a.id
      LEFT JOIN locations l ON t.location_id = l.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN ticket_stats ts ON ts.ticket_id = t.id

      WHERE t.id = $1
      LIMIT 1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Ticket tidak ditemukan",
        }),
        { status: 404 }
      );
    }

    const row = result.rows[0];

    // FORMAT RESPONSE   
    const data = {
      id: row.id,
      ticket_code: row.ticket_code,
      title: row.ticket_title,
      description: row.ticket_description,
      status: row.status,
      priority: row.priority,

      is_public: row.is_public,
      published_at: row.published_at,
      closed_at: row.closed_at,

      created_at: row.created_at,
      created_at_human: moment(row.created_at).fromNow(),

      user: {
        id: row.user_id,
        name: row.user_name,
        username: row.user_username,
      },

      assigned_admin: row.admin_id
        ? {
            id: row.admin_id,
            name: row.admin_name,
          }
        : null,

      location: {
        id: row.location_id,
        name: row.location_name,
        address: row.address,
      },

      category: {
        id: row.category_id,
        name: row.category_name,
      },

      stats: {
        views: row.views_count || 0,
        likes: row.likes_count || 0,
      },

      last_message: row.last_message || null,
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: "Berhasil mengambil detail ticket",
        data,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("ERROR GET TICKET DETAIL:", err);

    return new Response(
      JSON.stringify({
        success: false,
        message: err.message,
      }),
      { status: 500 }
    );
  }
}