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
     * ROLE VALIDATION
     * ===============================
     */
    if (!["admin", "superadmin"].includes(user.role)) {
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
          ticket_code,
          ticket_title,
          created_by,
          status,
          assigned_to,
          is_public
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
     * VALIDASI ASSIGNED ADMIN
     * ===============================
     */
    if (Number(ticket.assigned_to) !== Number(user.id)) {
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
     * VALIDASI STATUS
     * ===============================
     */
    if (ticket.status !== "proses") {
      return Response.json(
        {
          success: false,
          message: "Ticket tidak dapat diselesaikan",
        },
        { status: 400 },
      );
    }

    /**
     * ===============================
     * IF TICKET DOESN'T HAVE MESSAGE, RETURN ERROR
     * ===============================
     */

    const messageResult = await client.query(
      `
        SELECT id
        FROM ticket_messages
        WHERE ticket_id = $1
        LIMIT 1
      `,
      [ticketId],
    );

    if (messageResult.rowCount === 0) {
      return Response.json(
        {
          success: false,
          message: "Tiket belum memiliki history percakapan",
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
          status = 'selesai',
          waiting_reply_from = NULL,
          completed_at = NOW(),
          completed_by = $2,
          updated_at = NOW(),
          closed_at = NOW()
        WHERE id = $1
        AND status = 'proses'
        AND assigned_to = $2
        RETURNING *
      `,
      [ticketId, user.id],
    );

    if (updateResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return Response.json(
        {
          success: false,
          message: "Ticket tidak dapat diselesaikan",
        },
        { status: 400 },
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
      [ticketId, "complete", "proses", "selesai", user.id],
    );

    // Pelapor diberi notifikasi agar dapat melihat hasil dan memberi rating jika diperlukan.
    await createNotification(client, {
      userId: ticket.created_by,
      ticketId,
      type: "ticket_completed",
      title: "Laporan selesai",
      message: `Laporan ${ticket.ticket_code} telah diselesaikan oleh ${user.full_name || user.username}.`,
      metadata: {
        ticket_code: ticket.ticket_code,
        ticket_title: ticket.ticket_title,
        completed_by: user.id,
        url: `/ticket-details/${ticketId}`,
      },
    });

    const staffUserIds = await getActiveStaffUserIds(client, [user.id]);

    // Staff lain mendapat ringkasan penyelesaian untuk monitoring layanan.
    await createNotificationsForUsers(client, staffUserIds, {
      ticketId,
      type: "ticket_completed_by_staff",
      title: "Laporan diselesaikan",
      message: `${user.full_name || user.username} menyelesaikan ${ticket.ticket_code}.`,
      metadata: {
        ticket_code: ticket.ticket_code,
        ticket_title: ticket.ticket_title,
        completed_by: user.id,
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
      message: "Ticket berhasil diselesaikan",
      data: updateResult.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("ERROR COMPLETE TICKET:", err);

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
