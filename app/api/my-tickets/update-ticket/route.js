import fs from "fs";
import path from "path";
import pool from "@/lib/dbConfig";
import { cookies } from "next/headers";
import sanitizeFileName from "@/app/utils/sanitizeFileName";

const uploadDir = path.join(process.cwd(), "uploads/tickets");

export async function POST(req) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("dataUser");

  // =============================
  // AUTH
  // =============================
  if (!userCookie) {
    return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let user;

  try {
    user = JSON.parse(userCookie.value);
  } catch {
    return Response.json({ success: false, message: "Invalid session" }, { status: 401 });
  }

  const client = await pool.connect();

  try {
    const formData = await req.formData();

    const ticket_code = formData.get("ticket_code");
    const location_id = formData.get("location_id");
    const category_id = formData.get("category_id");
    const ticket_title = formData.get("ticket_title");
    const ticket_description = formData.get("ticket_description");

    const files = formData.getAll("images");

    // =============================
    // VALIDASI
    // =============================
    if (!ticket_code) {
      return Response.json({ success: false, message: "Ticket code tidak valid" }, { status: 400 });
    }

    if (!location_id || !category_id || !ticket_title || !ticket_description) {
      return Response.json({ success: false, message: "Semua field wajib diisi" }, { status: 400 });
    }

    if (ticket_title.length > 100) {
      return Response.json({ success: false, message: "Judul maksimal 100 karakter" }, { status: 400 });
    }

    if (ticket_description.length > 1000) {
      return Response.json({ success: false, message: "Deskripsi maksimal 1000 karakter" }, { status: 400 });
    }

    if (files.length > 3) {
      return Response.json({ success: false, message: "Maksimal 3 gambar" }, { status: 400 });
    }

    const MAX_SIZE = 3 * 1024 * 1024;

    // =============================
    // START TRANSACTION
    // =============================
    await client.query("BEGIN");

    /**
     * =============================
     * GET EXISTING TICKET
     * =============================
     */
    const ticketRes = await client.query(
      `SELECT id, status FROM tickets WHERE ticket_code = $1 AND created_by = $2 LIMIT 1`,
      [ticket_code, user.id]
    );

    if (ticketRes.rowCount === 0) {
      throw new Error("Ticket tidak ditemukan");
    }

    const ticket = ticketRes.rows[0];

    // hanya boleh edit jika pending
    if (ticket.status !== "pending") {
      throw new Error("Hanya tiket dengan status pending yang bisa diperbarui");
    }

    const ticketId = ticket.id;

    /**
     * =============================
     * GET OLD IMAGES
     * =============================
     */
    const oldImagesRes = await client.query(
      `SELECT image_url FROM attachments WHERE ticket_id = $1`,
      [ticketId]
    );

    const oldImages = oldImagesRes.rows.map((r) => r.image_url);

    /**
     * =============================
     * UPDATE TICKET
     * =============================
     */
    await client.query(
      `UPDATE tickets SET
        location_id = $1,
        category_id = $2,
        ticket_title = $3,
        ticket_description = $4,
        updated_at = NOW()
      WHERE id = $5`,
      [location_id, category_id, ticket_title, ticket_description, ticketId]
    );

    /**
     * =============================
     * HANDLE NEW IMAGES
     * =============================
     */
    let savedFiles = [];

    const ticketFolder = path.join(uploadDir, ticket_code);

    if (!fs.existsSync(ticketFolder)) {
      fs.mkdirSync(ticketFolder, { recursive: true });
    }

    if (files.length > 0) {
      // hapus attachment lama di DB
      await client.query(`DELETE FROM attachments WHERE ticket_id = $1`, [ticketId]);

      let index = 0;

      for (const file of files) {
        if (!file || !file.name) continue;

        if (file.size > MAX_SIZE) {
          throw new Error("Ukuran gambar maksimal 3MB");
        }

        const ext = path.extname(file.name).toLowerCase();

        if (![".jpg", ".jpeg", ".png"].includes(ext)) {
          throw new Error("Format gambar tidak valid");
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const safeName = sanitizeFileName(user.full_name || "user");

        const filename = `${safeName}_${ticket_code}_${index}${ext}`;

        const filepath = path.join(ticketFolder, filename);

        savedFiles.push({
          buffer,
          filepath,
          dbPath: `/api/uploads/tickets/${ticket_code}/${filename}`,
        });

        index++;
      }

      // insert new attachments
      if (savedFiles.length > 0) {
        const values = savedFiles
          .map((_, i) => `($1, NULL, $${i + 2})`)
          .join(",");

        await client.query(
          `INSERT INTO attachments (ticket_id, message_id, image_url)
           VALUES ${values}`,
          [ticketId, ...savedFiles.map((f) => f.dbPath)]
        );
      }
    }

    /**
     * =============================
     * LOG
     * =============================
     */
    await client.query(
      `INSERT INTO ticket_logs (ticket_id, action, new_value, changed_by)
       VALUES ($1, 'update', $2, $3)`,
      [
        ticketId,
        JSON.stringify({
          title: ticket_title,
          category_id,
        }),
        user.id,
      ]
    );

    /**
     * =============================
     * COMMIT
     * =============================
     */
    await client.query("COMMIT");

    /**
     * =============================
     * FILE SYSTEM (AFTER COMMIT)
     * =============================
     */

    // hapus file lama
    for (const img of oldImages) {
      try {
        const oldPath = path.join(process.cwd(), img.replace("/api/uploads/", "uploads/"));
        if (fs.existsSync(oldPath)) {
          await fs.promises.unlink(oldPath);
        }
      } catch (err) {
        console.warn("Gagal hapus file lama:", err.message);
      }
    }

    // simpan file baru
    for (const file of savedFiles) {
      await fs.promises.writeFile(file.filepath, file.buffer);
    }

    return Response.json({
      success: true,
      message: "Ticket berhasil diperbarui",
    });

  } catch (err) {
    await client.query("ROLLBACK");

    console.error("ERROR EDIT TICKET:", err);

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