import pool from "@/lib/dbConfig";
import { cookies } from "next/headers";

export async function POST(req) {
  const client = await pool.connect();

  try {
    const body = await req.json();

    const ticketId = Number(body.ticket_id);

    /**
     * ===============================
     * VALIDATION
     * ===============================
     */
    if (!ticketId || isNaN(ticketId)) {
      return Response.json(
        {
          success: false,
          message: "ID ticket tidak valid",
        },
        { status: 400 },
      );
    }

    /**
     * ===============================
     * CHECK TICKET
     * ===============================
     */
    const ticketResult = await client.query(
      `
        SELECT id
        FROM tickets
        WHERE id = $1
        AND is_public = TRUE
        AND status = 'selesai'
        LIMIT 1
      `,
      [ticketId],
    );

    if (ticketResult.rowCount === 0) {
      return Response.json(
        {
          success: false,
          message: "Ticket tidak ditemukan",
        },
        { status: 404 },
      );
    }

    /**
     * ===============================
     * OPTIONAL USER
     * ===============================
     */
    const cookieStore = await cookies();

    const userCookie = cookieStore.get("dataUser");

    let userId = null;

    if (userCookie) {
      try {
        const user = JSON.parse(userCookie.value);

        userId = user.id;
      } catch {}
    }

    /**
     * ===============================
     * INSERT VIEW
     * ===============================
     */
    await client.query(
      `
        INSERT INTO ticket_views (
          ticket_id,
          user_id,
          viewed_at
        )
        VALUES ($1, $2, NOW())
      `,
      [ticketId, userId],
    );

    /**
     * ===============================
     * UPSERT STATS
     * ===============================
     */
    await client.query(
      `
        INSERT INTO ticket_stats (
          ticket_id,
          views_count,
          likes_count,
          created_at,
          updated_at
        )
        VALUES ($1, 1, 0, NOW(), NOW())

        ON CONFLICT (ticket_id)
        DO UPDATE SET
          views_count = ticket_stats.views_count + 1,
          updated_at = NOW()
      `,
      [ticketId],
    );

    return Response.json({
      success: true,
      message: "View berhasil ditambahkan",
    });
  } catch (err) {
    console.log("ERROR ADD VIEW:", err);

    return Response.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
