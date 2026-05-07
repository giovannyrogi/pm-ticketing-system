import pool from "@/lib/dbConfig";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import moment from "moment";
import sanitizeFileName from "@/app/utils/sanitizeFileName";

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
     * FORM DATA
     * ===============================
     */
    const formData = await req.formData();

    const ticketId = formData.get("ticket_id");

    const message = formData.get("message")?.trim();

    const images = formData.getAll("images");

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

    if (!message) {
      return Response.json(
        {
          success: false,
          message: "Pesan wajib diisi",
        },
        { status: 400 },
      );
    }

    if (images.length > 3) {
      return Response.json(
        {
          success: false,
          message: "Maksimal 3 gambar",
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
          t.id,
          t.ticket_code,
          t.status,
          t.created_by,
          t.assigned_to,
          t.last_reply_role,
          t.waiting_reply_from,

          creator.role as creator_role,

          admin.role as admin_role

        FROM tickets t

        LEFT JOIN users creator
        ON creator.id = t.created_by

        LEFT JOIN users admin
        ON admin.id = t.assigned_to

        WHERE t.id = $1

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
     * FLOW VALIDATION
     * ===============================
     */
    if (ticket.waiting_reply_from && ticket.waiting_reply_from !== user.role) {
      return Response.json(
        {
          success: false,
          message:
            user.role === "user"
              ? "Silakan tunggu balasan admin"
              : "Silakan tunggu balasan user",
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
          message: "Ticket tidak aktif",
        },
        { status: 400 },
      );
    }

    /**
     * ===============================
     * VALIDASI AKSES CHAT
     * ===============================
     */

    const isTicketOwner = Number(ticket.created_by) === Number(user.id);

    const isAssignedAdmin = Number(ticket.assigned_to) === Number(user.id);

    if (!isTicketOwner && !isAssignedAdmin) {
      return Response.json(
        {
          success: false,
          message: "Tidak memiliki akses",
        },
        { status: 403 },
      );
    }

    /**
     * ===============================
     * VALIDASI STATUS
     * ===============================
     */

    if (ticket.status === "selesai") {
      return Response.json(
        {
          success: false,
          message: "Ticket sudah diselesaikan",
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
     * INSERT MESSAGE
     * ===============================
     */
    const insertMessageResult = await client.query(
      `
        INSERT INTO ticket_messages (
          ticket_id,
          sender_id,
          sender_role,
          message,
          created_at,
          updated_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          NOW(),
          NOW()
        )
        RETURNING *
      `,
      [ticketId, user.id, user.role, message],
    );

    const newMessage = insertMessageResult.rows[0];

    /**
     * ===============================
     * UPDATE WAITING REPLY
     * ===============================
     */
    await client.query(
      `
        UPDATE tickets
        SET
          last_reply_role = $1,
          waiting_reply_from = $2,
          updated_at = NOW()
        WHERE id = $3
      `,
      [user.role, user.role === "user" ? "admin" : "user", ticketId],
    );

    /**
     * ===============================
     * UPLOAD IMAGES
     * ===============================
     */
    let uploadedImages = [];

    const uploadDir = path.join(process.cwd(), "uploads", "ticket-messages");

    // pastikan folder ada
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, {
        recursive: true,
      });
    }

    if (images.length > 0) {
      /**
       * ===============================
       * CREATE FOLDER PER TICKET
       * ===============================
       */
      const messageFolder = path.join(uploadDir, ticket.ticket_code);

      if (!fs.existsSync(messageFolder)) {
        fs.mkdirSync(messageFolder, {
          recursive: true,
        });
      }

      /**
       * ===============================
       * PREPARE FILE
       * ===============================
       */
      const savedFiles = [];

      let index = 0;

      for (const file of images) {
        if (!file || !file.name) continue;

        /**
         * VALIDASI SIZE
         */
        const MAX_SIZE = 3 * 1024 * 1024;

        if (file.size > MAX_SIZE) {
          throw new Error("Ukuran gambar maksimal 3MB");
        }

        const ext = path.extname(file.name).toLowerCase();

        /**
         * VALIDASI EXTENSION
         */
        if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
          throw new Error("Format gambar tidak valid");
        }

        const arrayBuffer = await file.arrayBuffer();

        const buffer = Buffer.from(arrayBuffer);

        const safeName = sanitizeFileName(user.full_name || "user");

        /**
         * FILENAME
         */
        const filename = `${safeName}_${ticket.ticket_code}_${newMessage.id}_${index}${ext}`;

        const filepath = path.join(messageFolder, filename);

        const dbPath = `/api/uploads/ticket-messages/${ticket.ticket_code}/${filename}`;

        savedFiles.push({
          buffer,
          filepath,
          dbPath,
          fileType: file.type,
        });

        index++;
      }

      /**
       * ===============================
       * INSERT ATTACHMENTS
       * ===============================
       */
      for (const file of savedFiles) {
        await client.query(
          `
        INSERT INTO attachments (
          message_id,
          image_url,
          file_type,
          created_at
        )
        VALUES (
          $1,
          $2,
          $3,
          NOW()
        )
      `,
          [newMessage.id, file.dbPath, file.fileType],
        );

        uploadedImages.push(file.dbPath);
      }

      /**
       * ===============================
       * SAVE FILE AFTER INSERT
       * ===============================
       */
      for (const file of savedFiles) {
        await fs.promises.writeFile(file.filepath, file.buffer);
      }
    }

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
      message: "Pesan berhasil dikirim",

      data: {
        id: newMessage.id,
        ticket_id: ticketId,
        sender_id: user.id,
        sender_name: user.full_name,
        sender_role: user.role,
        message: newMessage.message,
        images: uploadedImages,
        created_at: newMessage.created_at,
        created_at_human: moment(newMessage.created_at).fromNow(),
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("ERROR SEND MESSAGE:", err);

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
