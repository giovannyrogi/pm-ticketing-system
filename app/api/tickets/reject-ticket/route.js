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

    const rejectedReason = body.rejected_reason?.trim();

    /**
     * ===============================
     * VALIDASI
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

    if (!rejectedReason) {
      return Response.json(
        {
          success: false,
          message: "Alasan penolakan wajib diisi",
        },
        { status: 400 },
      );
    }

    if (rejectedReason.length > 500) {
      return Response.json(
        {
          success: false,
          message: "Alasan penolakan maksimal 500 karakter",
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
          rejected_by
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
     * VALIDASI STATUS
     * ===============================
     */
    if (ticket.status !== "pending") {
      return Response.json(
        {
          success: false,
          message: "Ticket sudah diproses admin lain",
        },
        { status: 400 },
      );
    }

    /**
     * ===============================
     * VALIDASI ASSIGNED
     * ===============================
     */
    if (ticket.assigned_to) {
      return Response.json(
        {
          success: false,
          message: "Ticket sudah diambil admin lain",
        },
        { status: 400 },
      );
    }

    /**
     * ===============================
     * TRANSACTION
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
          status = 'ditolak',
          rejected_by = $1,
          rejected_at = NOW(),
          rejected_reason = $2,
          updated_at = NOW()
        WHERE id = $3
        AND status = 'pending'
        AND assigned_to IS NULL
        RETURNING *
      `,
      [user.id, rejectedReason, ticketId],
    );

    if (updateResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return Response.json(
        {
          success: false,
          message: "Ticket sudah diproses admin lain",
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
      [
        ticketId,
        "reject",
        "pending",
        JSON.stringify({
          status: "ditolak",
          reason: rejectedReason,
        }),
        user.id,
      ],
    );

    // Pelapor perlu mendapat alasan penolakan agar bisa memahami keputusan admin.
    await createNotification(client, {
      userId: ticket.created_by,
      ticketId,
      type: "ticket_rejected",
      title: "Laporan ditolak",
      message: `Laporan ${ticket.ticket_code} ditolak oleh ${user.full_name || user.username}. Klik disini untuk melihat detail penolakan.`,
      metadata: {
        ticket_code: ticket.ticket_code,
        ticket_title: ticket.ticket_title,
        rejected_by: user.id,
        rejected_reason: rejectedReason,
        url: `/ticket-details/${ticketId}`,
      },
    });

    const staffUserIds = await getActiveStaffUserIds(client, [user.id]);

    // Staff lain perlu mendapat ringkasan saat laporan ditolak oleh staff/superadmin.
    await createNotificationsForUsers(client, staffUserIds, {
      ticketId,
      type: "ticket_rejected_by_staff",
      title: "Laporan ditolak",
      message: `${user.full_name || user.username} menolak ${ticket.ticket_code}. Klik disini untuk melihat detail penolakan.`,
      metadata: {
        ticket_code: ticket.ticket_code,
        ticket_title: ticket.ticket_title,
        rejected_by: user.id,
        rejected_reason: rejectedReason,
        url: `/ticket-details/${ticketId}`,
      },
    });

    await client.query("COMMIT");

    /**
     * ===============================
     * RESPONSE
     * ===============================
     */
    return Response.json({
      success: true,
      message: "Laporan berhasil ditolak",
      data: updateResult.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("ERROR REJECT TICKET:", err);

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
