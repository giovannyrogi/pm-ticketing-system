import pool from "@/lib/dbConfig";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import {
  requireSuperadmin,
  sanitizeUserPayload,
  toAdminUser,
  validateUserPayload,
} from "./_utils";

export async function GET(req) {
  try {
    const auth = await requireSuperadmin(req);
    if (auth.error) return auth.error;

    const result = await pool.query(
      `
        SELECT id, full_name, username, role, email, phone_number, is_active
        FROM users
        ORDER BY id DESC
      `,
    );

    return NextResponse.json({
      success: true,
      data: result.rows.map(toAdminUser),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data user" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const auth = await requireSuperadmin(req);
    if (auth.error) return auth.error;

    const payload = await req.json();
    const sanitized = sanitizeUserPayload(payload);
    const password = String(payload.password ?? "");

    const validationMessage = validateUserPayload({
      ...sanitized,
      password,
      requirePassword: true,
    });

    if (validationMessage) {
      return NextResponse.json(
        { success: false, message: validationMessage },
        { status: 400 },
      );
    }

    const duplicateRes = await pool.query(
      `
        SELECT id, username, email, phone_number
        FROM users
        WHERE username = $1 OR email = $2 OR phone_number = $3
        LIMIT 1
      `,
      [sanitized.username, sanitized.email, sanitized.phoneNumber],
    );

    if (duplicateRes.rowCount > 0) {
      const duplicate = duplicateRes.rows[0];
      const message =
        duplicate.username === sanitized.username
          ? "Username sudah digunakan"
          : duplicate.email === sanitized.email
            ? "Email sudah digunakan"
            : "Nomor telepon sudah digunakan";

      return NextResponse.json({ success: false, message }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `
        INSERT INTO users
          (full_name, username, password, role, email, phone_number, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, full_name, username, role, email, phone_number, is_active
      `,
      [
        sanitized.fullName,
        sanitized.username,
        hashedPassword,
        sanitized.role,
        sanitized.email,
        sanitized.phoneNumber,
        sanitized.isActive,
      ],
    );

    return NextResponse.json({
      success: true,
      message: "Akun berhasil dibuat",
      data: toAdminUser(result.rows[0]),
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat akun" },
      { status: 500 },
    );
  }
}
