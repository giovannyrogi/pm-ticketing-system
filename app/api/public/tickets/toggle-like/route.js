import pool from "@/lib/dbConfig";
import { cookies } from "next/headers";

export async function POST(req) {
  const client = await pool.connect();

  try {
    /**
     * ===============================
     * AUTH
     * ===============================
     */
    const cookieStore = await cookies();

    const userCookie = cookieStore.get("dataUser");

    if (!userCookie) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    let user;

    try {
      user = JSON.parse(userCookie.value);
    } catch {
      return Response.json(
        {
          success: false,
          message: "Invalid session",
        },
        { status: 401 },
      );
    }

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
     * CHECK EXISTING LIKE
     * ===============================
     */
    const existingLike = await client.query(
      `
        SELECT id
        FROM ticket_likes
        WHERE ticket_id = $1
        AND user_id = $2
        LIMIT 1
      `,
      [ticketId, user.id],
    );

    let liked = false;

    /**
     * ===============================
     * UNLIKE
     * ===============================
     */
    if (existingLike.rowCount > 0) {
      await client.query(
        `
          DELETE FROM ticket_likes
          WHERE ticket_id = $1
          AND user_id = $2
        `,
        [ticketId, user.id],
      );

      await client.query(
        `
          UPDATE ticket_stats
          SET
            likes_count = GREATEST(likes_count - 1, 0),
            updated_at = NOW()
          WHERE ticket_id = $1
        `,
        [ticketId],
      );

      liked = false;
    } else {
      await client.query(
        `
          INSERT INTO ticket_likes (
            ticket_id,
            user_id,
            created_at
          )
          VALUES ($1, $2, NOW())
        `,
        [ticketId, user.id],
      );

      await client.query(
        `
          INSERT INTO ticket_stats (
            ticket_id,
            likes_count,
            views_count,
            created_at,
            updated_at
          )
          VALUES ($1, 1, 0, NOW(), NOW())

          ON CONFLICT (ticket_id)
          DO UPDATE SET
            likes_count = ticket_stats.likes_count + 1,
            updated_at = NOW()
        `,
        [ticketId],
      );

      liked = true;
    }

    /**
     * ===============================
     * GET UPDATED STATS
     * ===============================
     */
    const statsResult = await client.query(
      `
        SELECT likes_count
        FROM ticket_stats
        WHERE ticket_id = $1
        LIMIT 1
      `,
      [ticketId],
    );

    return Response.json({
      success: true,
      message: liked ? "Liked" : "Unliked",
      data: {
        liked,
        likes_count: statsResult.rows[0]?.likes_count || 0,
      },
    });
  } catch (err) {
    console.log("ERROR TOGGLE LIKE:", err);

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