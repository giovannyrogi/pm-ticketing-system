import pool from "@/lib/dbConfig";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import {
  requireSuperadmin,
  sanitizeUserPayload,
  toAdminUser,
  validateUserPayload,
} from "../_utils";

export async function PATCH(req, { params }) {
  try {
    const auth = await requireSuperadmin(req);
    if (auth.error) return auth.error;

    const { id } = await params;
    const userId = Number(id);

    if (!Number.isInteger(userId)) {
      return NextResponse.json(
        { success: false, message: "ID user tidak valid" },
        { status: 400 },
      );
    }

    const payload = await req.json();
    const sanitized = sanitizeUserPayload(payload);
    const password = String(payload.password ?? "");

    const validationMessage = validateUserPayload({
      ...sanitized,
      password,
      requirePassword: false,
    });

    if (validationMessage) {
      return NextResponse.json(
        { success: false, message: validationMessage },
        { status: 400 },
      );
    }

    if (Number(auth.user.id) === userId && sanitized.role !== "superadmin") {
      return NextResponse.json(
        {
          success: false,
          message: "Role superadmin akun sendiri tidak boleh diturunkan",
        },
        { status: 400 },
      );
    }

    if (Number(auth.user.id) === userId && !sanitized.isActive) {
      return NextResponse.json(
        { success: false, message: "Akun sendiri tidak boleh dinonaktifkan" },
        { status: 400 },
      );
    }

    const duplicateRes = await pool.query(
      `
        SELECT id, username, email, phone_number
        FROM users
        WHERE id <> $1
          AND (username = $2 OR email = $3 OR phone_number = $4)
        LIMIT 1
      `,
      [userId, sanitized.username, sanitized.email, sanitized.phoneNumber],
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

    const updateValues = [
      sanitized.fullName,
      sanitized.username,
      sanitized.role,
      sanitized.email,
      sanitized.phoneNumber,
      sanitized.isActive,
      userId,
    ];

    let passwordSql = "";

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateValues.splice(6, 0, hashedPassword);
      passwordSql = ", password = $7";
    }

    const result = await pool.query(
      `
        UPDATE users
        SET
          full_name = $1,
          username = $2,
          role = $3,
          email = $4,
          phone_number = $5,
          is_active = $6
          ${passwordSql}
        WHERE id = $${password ? 8 : 7}
        RETURNING id, full_name, username, role, email, phone_number, is_active
      `,
      updateValues,
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Akun berhasil diperbarui",
      data: toAdminUser(result.rows[0]),
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui akun" },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = await requireSuperadmin(req);
    if (auth.error) return auth.error;

    const { id } = await params;
    const userId = Number(id);

    if (!Number.isInteger(userId)) {
      return NextResponse.json(
        { success: false, message: "ID user tidak valid" },
        { status: 400 },
      );
    }

    if (Number(auth.user.id) === userId) {
      return NextResponse.json(
        { success: false, message: "Akun sendiri tidak boleh dihapus" },
        { status: 400 },
      );
    }

    const userRes = await pool.query(
      `SELECT id, full_name, username FROM users WHERE id = $1 LIMIT 1`,
      [userId],
    );

    if (userRes.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);

    return NextResponse.json({
      success: true,
      message: "Akun berhasil dihapus",
      data: userRes.rows[0],
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus akun" },
      { status: 500 },
    );
  }
}
