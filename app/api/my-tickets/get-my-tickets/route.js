import pool from "@/lib/dbConfig";
import moment from "moment";
import { cookies } from "next/headers";

export async function GET() {
  const client = await pool.connect();

  try {
    /**
     * ===============================
     * GET USER FROM COOKIE
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

    /**
     * ===============================
     * QUERY
     * ===============================
     */
    const query = `
      SELECT 
        t.id,
        t.ticket_code,
        t.ticket_title,
        t.ticket_description,
        t.status,
        t.created_at,

        c.category_name,
        c.id as category_id,

        l.location_name,
        l.id as location_id,

        a.full_name as admin_name,
        
        att.image_url,

        (
          SELECT tm.message
          FROM ticket_messages tm
          WHERE tm.ticket_id = t.id
          ORDER BY tm.created_at DESC
          LIMIT 1
        ) as last_message

      FROM tickets t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN locations l ON t.location_id = l.id
      LEFT JOIN users a ON t.assigned_to = a.id
      LEFT JOIN attachments att ON att.ticket_id = t.id

      WHERE t.created_by = $1

      ORDER BY t.created_at DESC
    `;

    const result = await client.query(query, [user.id]);

    /**
     * ===============================
     *  GROUPING DATA (KEY FIX)
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
          category_name: row.category_name,
          category_id: row.category_id,
          location_name: row.location_name,
          location_id: row.location_id,
          status: row.status,
          created_at: row.created_at,
          created_at_human: moment(row.created_at).fromNow(),

          admin_name: row.admin_name || "-",
          last_message: row.last_message || null,

          images: [], // ARRAY UNTUK MENAMPUNG MULTIPLE IMAGES
        };
      }

      // push image kalau ada
      if (row.image_url) {
        ticketMap[row.id].images.push(row.image_url);
      }
    });

    const data = Object.values(ticketMap);

    return Response.json({
      success: true,
      message: "Berhasil mengambil data ticket user",
      data,
    });
  } catch (err) {
    console.error("ERROR GET MY TICKETS:", err);

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