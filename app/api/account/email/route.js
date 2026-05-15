import pool from "@/lib/dbConfig";
import bcrypt from "bcryptjs";
import { emailRegex } from "@/app/utils/validationTextField";
import { getAuthUser, jsonError, toPublicUser } from "../_utils";
import { NextResponse } from "next/server";

export async function PATCH(req) {
  try {
    const auth = await getAuthUser(req);

    if (auth.error) {
      return jsonError(auth.error, auth.status);
    }

    const { email, currentPassword } = await req.json();
    const sanitizedEmail = email?.trim().toLowerCase();

    if (!currentPassword) {
      return jsonError("Password saat ini harus diisi");
    }

    if (!sanitizedEmail) {
      return jsonError("Email harus diisi");
    }

    if (!emailRegex.test(sanitizedEmail)) {
      return jsonError("Format email tidak valid");
    }

    const isValidPassword = await bcrypt.compare(
      currentPassword,
      auth.user.password,
    );

    if (!isValidPassword) {
      return jsonError("Password saat ini salah", 401);
    }

    const duplicateRes = await pool.query(
      `SELECT id FROM users WHERE email = $1 AND id <> $2 LIMIT 1`,
      [sanitizedEmail, auth.user.id],
    );

    if (duplicateRes.rowCount > 0) {
      return jsonError("Email sudah digunakan");
    }

    const updatedRes = await pool.query(
      `
        UPDATE users
        SET email = $1
        WHERE id = $2
        RETURNING id, full_name, username, role, email, phone_number, is_active
      `,
      [sanitizedEmail, auth.user.id],
    );

    return NextResponse.json({
      success: true,
      message: "Email berhasil diperbarui",
      data: toPublicUser(updatedRes.rows[0]),
    });
  } catch (err) {
    console.error("UPDATE ACCOUNT EMAIL ERROR:", err);
    return jsonError("Gagal memperbarui email", 500);
  }
}
