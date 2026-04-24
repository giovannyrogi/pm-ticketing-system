import fs from "fs";
import path from "path";
import pool from "@/lib/dbConfig";
import moment from "moment";
import { cookies } from "next/headers";
import { generateUniqueTicketCode } from "@/app/utils/generateTicketCode";
import sanitizeFileName from "@/app/utils/sanitizeFileName";

const uploadDir = path.join(process.cwd(), "uploads/tickets");

// pastikan folder ada
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export async function POST(req) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("dataUser");

  // =============================
  // AUTH
  // =============================
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

  if (user?.expiresAt && user.expiresAt < Date.now()) {
    return Response.json(
      { success: false, message: "Session expired" },
      { status: 401 },
    );
  }

  const client = await pool.connect();

  try {
    const formData = await req.formData();

    const location_id = formData.get("location_id");
    const category_id = formData.get("category_id");
    const ticket_title = formData.get("ticket_title");
    const ticket_description = formData.get("ticket_description");

    const files = formData.getAll("images");

    // =============================
    // VALIDASI INPUT
    // =============================
    if (!location_id) {
      return Response.json(
        { success: false, message: "Wajib pilih lokasi" },
        { status: 400 },
      );
    }

    if (!category_id) {
      return Response.json(
        { success: false, message: "Wajib pilih kategori" },
        { status: 400 },
      );
    }

    if (!ticket_title) {
      return Response.json(
        { success: false, message: "Wajib isi judul tiket" },
        { status: 400 },
      );
    }

    if (!ticket_description) {
      return Response.json(
        { success: false, message: "Wajib isi deskripsi tiket" },
        { status: 400 },
      );
    }

    if (files.length > 3) {
      return Response.json(
        { success: false, message: "Maksimal 3 gambar" },
        { status: 400 },
      );
    }

    if (ticket_title.length > 100) {
      return Response.json(
        { success: false, message: "Judul maksimal 100 karakter" },
        { status: 400 },
      );
    }

    if (ticket_description.length > 1000) {
      return Response.json(
        { success: false, message: "Deskripsi maksimal 1000 karakter" },
        { status: 400 },
      );
    }

    const MAX_SIZE = 3 * 1024 * 1024; // 3MB

    // =============================
    // START TRANSACTION
    // =============================
    await client.query("BEGIN");

    // generate ticket code dulu
    const ticketCode = await generateUniqueTicketCode(client);

    // =============================
    // CREATE FOLDER PER TICKET
    // =============================
    const ticketFolder = path.join(uploadDir, ticketCode);

    if (!fs.existsSync(ticketFolder)) {
      fs.mkdirSync(ticketFolder, { recursive: true });
    }

    // =============================
    // PREPARE FILE
    // =============================
    const savedFiles = [];

    let index = 0;

    for (const file of files) {
      if (!file || !file.name) continue;

      // VALIDASI SIZE
      if (file.size > MAX_SIZE) {
        throw new Error("Ukuran gambar maksimal 3MB");
      }

      const ext = path.extname(file.name).toLowerCase();

      // VALIDASI EXTENSION
      if (![".jpg", ".jpeg", ".png"].includes(ext)) {
        throw new Error("Format gambar tidak valid");
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const safeName = sanitizeFileName(user.full_name || "user");

      // filename pakai ticket code + index
      const filename = `${safeName}_${ticketCode}_${index}${ext}`;

      const filepath = path.join(ticketFolder, filename);

      savedFiles.push({
        buffer,
        filepath,
        dbPath: `/api/uploads/tickets/${ticketCode}/${filename}`,
      });

      index++;
    }

    // =============================
    // INSERT TICKET
    // =============================
    const ticketResult = await client.query(
      `INSERT INTO tickets
      (ticket_code, created_by, location_id, ticket_title, ticket_description, category_id)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING id`,
      [
        ticketCode,
        user.id,
        location_id,
        ticket_title,
        ticket_description,
        category_id,
      ],
    );

    const ticketId = ticketResult.rows[0].id;

    // =============================
    // INSERT STATS
    // =============================
    await client.query(`INSERT INTO ticket_stats (ticket_id) VALUES ($1)`, [
      ticketId,
    ]);

    // =============================
    // INSERT ATTACHMENTS
    // =============================
    if (savedFiles.length > 0) {
      const values = savedFiles
        .map((_, i) => `($1, NULL, $${i + 2})`)
        .join(",");

      await client.query(
        `INSERT INTO attachments (ticket_id, message_id, image_url)
         VALUES ${values}`,
        [ticketId, ...savedFiles.map((f) => f.dbPath)],
      );
    }

    // =============================
    // LOG
    // =============================
    await client.query(
      `INSERT INTO ticket_logs (ticket_id, action, new_value, changed_by)
       VALUES ($1, 'create', $2, $3)`,
      [
        ticketId,
        JSON.stringify({
          title: ticket_title,
          category_id,
        }),
        user.id,
      ],
    );

    // =============================
    // COMMIT
    // =============================
    await client.query("COMMIT");

    // =============================
    // SAVE FILE AFTER COMMIT
    // =============================
    for (const file of savedFiles) {
      await fs.promises.writeFile(file.filepath, file.buffer);
    }

    // =============================
    // RESPONSE
    // =============================
    return Response.json({
      success: true,
      message: "Ticket berhasil dibuat",
      data: {
        ticket_id: ticketId,
        ticket_code: ticketCode,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("ERROR CREATE TICKET:", err);

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
