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
     * VALIDASI
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
          assigned_to
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
     * VALIDASI STATUS
     * ===============================
     */
    if (ticket.status !== "pending") {
      return Response.json(
        {
          success: false,
          message: "Ticket sudah diproses admin lain",
        },
        { status: 400 }
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
        { status: 400 }
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
          status = 'proses',
          assigned_to = $1,
          updated_at = NOW()
        WHERE id = $2
        AND status = 'pending'
        AND assigned_to IS NULL
        RETURNING *
      `,
      [user.id, ticketId]
    );

    if (updateResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return Response.json(
        {
          success: false,
          message: "Ticket sudah diproses admin lain",
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
        "approve",
        "pending",
        "proses",
        user.id,
      ]
    );

    // Beri tahu pelapor bahwa laporannya sudah mulai ditangani.
    await createNotification(client, {
      userId: ticket.created_by,
      ticketId,
      type: "ticket_approved",
      title: "Laporan mulai diproses",
      message: `Laporan ${ticket.ticket_code} sedang ditangani oleh ${user.full_name || user.username}.`,
      metadata: {
        ticket_code: ticket.ticket_code,
        ticket_title: ticket.ticket_title,
        assigned_to: user.id,
        url: `/ticket-details/${ticketId}`,
      },
    });

    const staffUserIds = await getActiveStaffUserIds(client, [user.id]);

    // Staff lain perlu melihat siapa yang mulai menangani laporan tanpa menerima notif dari aksi sendiri.
    await createNotificationsForUsers(client, staffUserIds, {
      ticketId,
      type: "ticket_assigned",
      title: "Laporan mulai ditangani",
      message: `${user.full_name || user.username} mulai menangani ${ticket.ticket_code}.`,
      metadata: {
        ticket_code: ticket.ticket_code,
        ticket_title: ticket.ticket_title,
        assigned_to: user.id,
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
      message: "Ticket berhasil diterima",
      data: updateResult.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("ERROR APPROVE TICKET:", err);

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
