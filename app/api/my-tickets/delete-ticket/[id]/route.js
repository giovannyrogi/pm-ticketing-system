import pool from "@/lib/dbConfig";
import fs from "fs";
import { cookies } from "next/headers";
import path from "path";
import {
  createNotificationsForUsers,
  getActiveStaffUserIds,
} from "@/app/api/notifications/_utils";

export async function DELETE(req, { params }) {
  const client = await pool.connect();

  try {
    const { id } = await params;

    if (!id) {
      return Response.json(
        { success: false, message: "ID ticket wajib ada" },
        { status: 400 },
      );
    }

    /**
     * ===============================
     * AUTH
     * ===============================
     */
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("dataUser");

    if (!userCookie) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    let user;
    try {
      user = JSON.parse(userCookie.value);
    } catch {
      return Response.json(
        { success: false, message: "Invalid session" },
        { status: 401 },
      );
    }

    /**
     * ===============================
     * GET TICKET
     * ===============================
     */
    const ticketResult = await client.query(
      `
        SELECT id, ticket_code, ticket_title, status, created_by
        FROM tickets
        WHERE id = $1
        LIMIT 1
      `,
      [id],
    );

    if (ticketResult.rowCount === 0) {
      return Response.json(
        { success: false, message: "Ticket tidak ditemukan" },
        { status: 404 },
      );
    }

    const ticket = ticketResult.rows[0];

    if (user.role === "user" && ticket.created_by !== user.id) {
      return Response.json(
        { success: false, message: "Tidak memiliki akses" },
        { status: 403 },
      );
    }

    if (ticket.status !== "pending") {
      return Response.json(
        {
          success: false,
          message: "Hanya tiket dengan status pending yang bisa dihapus",
        },
        { status: 400 },
      );
    }

    /**
     * ===============================
     * PATH FOLDER
     * ===============================
     */
    const ticketFolder = path.join(
      process.cwd(),
      "uploads",
      "tickets",
      ticket.ticket_code,
    );

    /**
     * ===============================
     * INSERT LOG & DELETE TICKET
     * ===============================
     */
    await client.query("BEGIN");

    // INSERT LOG SEBELUM DELETE
    await client.query(
      `INSERT INTO ticket_logs (ticket_id, action, old_value, changed_by)
       VALUES ($1, 'delete', $2, $3)`,
      [
        ticket.id,
        JSON.stringify({
          ticket_code: ticket.ticket_code,
          title: ticket.ticket_title,
          status: ticket.status,
        }),
        user.id,
      ],
    );

    if (user.role === "user") {
      const staffUserIds = await getActiveStaffUserIds(client);

      // ticket_id sengaja tidak diisi agar notifikasi pembatalan tidak ikut terhapus oleh cascade delete tiket.
      await createNotificationsForUsers(client, staffUserIds, {
        type: "ticket_deleted_by_user",
        title: "Laporan dibatalkan",
        message: `${user.full_name || user.username} membatalkan laporan ${ticket.ticket_code} sebelum diproses.`,
        metadata: {
          ticket_id: ticket.id,
          ticket_code: ticket.ticket_code,
          ticket_title: ticket.ticket_title,
          deleted_by: user.id,
          deleted_by_role: user.role,
          is_deleted_ticket: true,
          url: "/ticket-list",
        },
      });
    }

    // DELETE TICKET (cascade jalan otomatis)
    await client.query(`DELETE FROM tickets WHERE id = $1`, [id]);

    await client.query("COMMIT");

    /**
     * ===============================
     * DELETE FILE (SETELAH DB SUCCESS)
     * ===============================
     */
    try {
      if (fs.existsSync(ticketFolder)) {
        await fs.promises.rm(ticketFolder, {
          recursive: true,
          force: true,
        });
      }
    } catch (fileErr) {
      console.error("ERROR DELETE FOLDER:", fileErr);
    }

    return Response.json({
      success: true,
      message: "Ticket berhasil dihapus",
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("ERROR DELETE TICKET:", err);

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
