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

    /**
     * ===============================
     * ONLY USER ROLE
     * ===============================
     */
    if (user.role !== "user") {
      return Response.json(
        {
          success: false,
          message: "Forbidden",
        },
        { status: 403 },
      );
    }

    /**
     * ===============================
     * BODY
     * ===============================
     */
    const body = await req.json();

    const ticketId = Number(body.ticket_id);

    const ratingValue = Number(body.rating_value);

    const ratingComment = body.rating_comment?.trim() || null;

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
     * VALIDATE RATING
     * ===============================
     */
    if (
      !ratingValue ||
      isNaN(ratingValue) ||
      ratingValue < 1 ||
      ratingValue > 5
    ) {
      return Response.json(
        {
          success: false,
          message: "Rating harus antara 1 sampai 5",
        },
        { status: 400 },
      );
    }

    /**
     * ===============================
     * COMMENT LIMIT
     * ===============================
     */
    if (ratingComment && ratingComment.length > 500) {
      return Response.json(
        {
          success: false,
          message: "Ulasan maksimal 500 karakter",
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
        SELECT
          id,
          created_by,
          status,
          rating_value
        FROM tickets
        WHERE id = $1
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

    const ticket = ticketResult.rows[0];

    /**
     * ===============================
     * OWNER VALIDATION
     * ===============================
     */
    if (Number(ticket.created_by) !== Number(user.id)) {
      return Response.json(
        {
          success: false,
          message: "Anda tidak memiliki akses",
        },
        { status: 403 },
      );
    }

    /**
     * ===============================
     * STATUS VALIDATION
     * ===============================
     */
    if (ticket.status !== "selesai") {
      return Response.json(
        {
          success: false,
          message: "Ticket belum selesai",
        },
        { status: 400 },
      );
    }

    /**
     * ===============================
     * ALREADY RATED
     * ===============================
     */
    if (ticket.rating_value) {
      return Response.json(
        {
          success: false,
          message: "Ticket sudah diberi penilaian",
        },
        { status: 400 },
      );
    }

    /**
     * ===============================
     * START TRANSACTION
     * ===============================
     */
    await client.query("BEGIN");

    /**
     * ===============================
     * UPDATE TICKET
     * ===============================
     */
    const updateResult = await client.query(
      `
        UPDATE tickets
        SET
          rating_value = $1,
          rating_comment = $2,
          rated_by = $3,
          rated_at = NOW(),
          updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `,
      [
        ratingValue,
        ratingComment,
        user.id,
        ticketId,
      ],
    );

    /**
     * ===============================
     * INSERT LOG
     * ===============================
     */
    await client.query(
      `
        INSERT INTO ticket_logs (
          ticket_id,
          action,
          old_value,
          new_value,
          changed_by,
          created_at,
          updated_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          NOW(),
          NOW()
        )
      `,
      [
        ticketId,
        "rating",
        null,
        JSON.stringify({
          rating_value: ratingValue,
          rating_comment: ratingComment,
        }),
        user.id,
      ],
    );

    /**
     * ===============================
     * COMMIT
     * ===============================
     */
    await client.query("COMMIT");

    /**
     * ===============================
     * RESPONSE
     * ===============================
     */
    return Response.json({
      success: true,
      message: "Penilaian berhasil dikirim",
      data: updateResult.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("ERROR RATE TICKET:", err);

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