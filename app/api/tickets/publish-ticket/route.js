import pool from "@/lib/dbConfig";
import { cookies } from "next/headers";
import {
  createNotification,
  createNotificationsForUsers,
  getActiveStaffUserIds,
} from "@/app/api/notifications/_utils";

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
        { status: 401 }
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
        { status: 401 }
      );
    }

    /**
     * ===============================
     * ROLE VALIDATION
     * ===============================
     */
    if (!["admin", "superadmin"].includes(user.role)) {
      return Response.json(
        {
          success: false,
          message: "Forbidden",
        },
        { status: 403 }
      );
    }

    /**
     * ===============================
     * BODY
     * ===============================
     */
    const body = await req.json();

    const ticketId = body.ticket_id;

    /**
     * ===============================
     * VALIDATION
     * ===============================
     */
    if (!ticketId || isNaN(Number(ticketId))) {
      return Response.json(
        {
          success: false,
          message: "ID ticket tidak valid",
        },
        { status: 400 }
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
          ticket_code,
          ticket_title,
          created_by,
          status,
          assigned_to,
          is_public,
          published_at
        FROM tickets
        WHERE id = $1
        LIMIT 1
      `,
      [ticketId]
    );

    if (ticketResult.rowCount === 0) {
      return Response.json(
        {
          success: false,
          message: "Ticket tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const ticket = ticketResult.rows[0];

    /**
     * ===============================
     * VALIDASI ASSIGNED ADMIN
     * ===============================
     */
    if (Number(ticket.assigned_to) !== Number(user.id)) {
      return Response.json(
        {
          success: false,
          message: "Anda tidak memiliki akses",
        },
        { status: 403 }
      );
    }

    /**
     * ===============================
     * VALIDASI STATUS
     * ===============================
     */
    if (ticket.status !== "selesai") {
      return Response.json(
        {
          success: false,
          message: "Ticket harus diselesaikan terlebih dahulu",
        },
        { status: 400 }
      );
    }

    /**
     * ===============================
     * VALIDASI PUBLIC
     * ===============================
     */
    if (ticket.is_public) {
      return Response.json(
        {
          success: false,
          message: "Ticket sudah dipublish",
        },
        { status: 400 }
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
          is_public = TRUE,
          published_at = NOW(),
          updated_at = NOW()
        WHERE id = $1
        AND status = 'selesai'
        AND assigned_to = $2
        AND is_public = FALSE
        RETURNING *
      `,
      [ticketId, user.id]
    );

    if (updateResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return Response.json(
        {
          success: false,
          message: "Ticket tidak bisa dipublish",
        },
        { status: 400 }
      );
    }

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
        "publish",
        "private",
        "public",
        user.id,
      ]
    );

    // Pelapor mendapat informasi ketika laporannya dipublikasikan ke halaman publik.
    await createNotification(client, {
      userId: ticket.created_by,
      ticketId,
      type: "ticket_published",
      title: "Laporan dipublikasikan",
      message: `Laporan ${ticket.ticket_code} sudah tersedia di halaman publik.`,
      metadata: {
        ticket_code: ticket.ticket_code,
        ticket_title: ticket.ticket_title,
        published_by: user.id,
        url: `/ticket-details/${ticketId}`,
      },
    });

    const staffUserIds = await getActiveStaffUserIds(client, [user.id]);

    // Staff lain mendapat informasi saat laporan tersedia untuk publik.
    await createNotificationsForUsers(client, staffUserIds, {
      ticketId,
      type: "ticket_published_by_staff",
      title: "Laporan dipublikasikan",
      message: `${user.full_name || user.username} mempublikasikan ${ticket.ticket_code}.`,
      metadata: {
        ticket_code: ticket.ticket_code,
        ticket_title: ticket.ticket_title,
        published_by: user.id,
        url: `/ticket-details/${ticketId}`,
      },
    });

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
      message: "Ticket berhasil dipublish",
      data: updateResult.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("ERROR PUBLISH TICKET:", err);

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
