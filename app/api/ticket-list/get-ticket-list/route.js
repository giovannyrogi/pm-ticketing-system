import pool from "@/lib/dbConfig";
import moment from "moment";
import { cookies } from "next/headers";

export async function GET() {
  const client = await pool.connect();

  try {
    /**
     * ===============================
     * AUTH (ADMIN ONLY)
     * ===============================
     */
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("dataUser");

    if (!userCookie) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    let user;
    try {
      user = JSON.parse(userCookie.value);
    } catch {
      return Response.json(
        { success: false, message: "Invalid session" },
        { status: 401 }
      );
    }

    // hanya admin / superadmin
    if (!["admin", "superadmin"].includes(user.role)) {
      return Response.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    /**
     * ===============================
     * QUERY ADMIN TICKETS
     * ===============================
     */
    const query = `
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

        -- user (pelapor)
        u.id as user_id,
        u.full_name as user_name,

        -- admin handler
        a.id as admin_id,
        a.full_name as admin_name,

        -- category
        c.id as category_id,
        c.category_name,

        -- location
        l.id as location_id,
        l.location_name,

        -- attachment
        att.image_url,

        -- stats
        ts.views_count,
        ts.likes_count

      FROM tickets t
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN users a ON t.assigned_to = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN locations l ON t.location_id = l.id
      LEFT JOIN attachments att ON att.ticket_id = t.id
      LEFT JOIN ticket_stats ts ON ts.ticket_id = t.id

      ORDER BY t.created_at DESC
    `;

    const result = await client.query(query);

    /**
     * ===============================
     * GROUPING (MULTI IMAGE FIX)
     * ===============================
     */
    const ticketMap = {};

    result.rows.forEach((row) => {
      if (!ticketMap[row.id]) {
        ticketMap[row.id] = {
          id: row.id,
          ticket_code: row.ticket_code,
          ticket_title: row.ticket_title,
          ticket_description: row.ticket_description,

          status: row.status,
          priority: row.priority,

          created_at: row.created_at,
          created_at_human: moment(row.created_at).fromNow(),

          updated_at: row.updated_at,

          assigned_to: row.assigned_to,

          // user
          user: {
            id: row.user_id,
            name: row.user_name,
          },

          // admin
          admin: row.admin_id
            ? {
                id: row.admin_id,
                name: row.admin_name,
              }
            : null,

          // category
          category: {
            id: row.category_id,
            name: row.category_name,
          },

          // location
          location: {
            id: row.location_id,
            name: row.location_name,
          },

          // stats
          stats: {
            views: row.views_count || 0,
            likes: row.likes_count || 0,
          },

          // last_message: row.last_message || null,

          images: [],
        };
      }

      // push image
      if (row.image_url) {
        ticketMap[row.id].images.push(row.image_url);
      }
    });

    const data = Object.values(ticketMap);

    return Response.json({
      success: true,
      message: "Berhasil mengambil data ticket admin",
      data,
    });
  } catch (err) {
    console.error("ERROR GET ADMIN TICKETS:", err);

    return Response.json(
      {
        success: false,
        message: err.message || "Internal server error",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}