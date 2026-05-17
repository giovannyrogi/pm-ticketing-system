import pool from "@/lib/dbConfig";
import bcrypt from "bcryptjs";
import { getAuthUser, jsonError } from "../_utils";
import { NextResponse } from "next/server";
import {
  validateAuthPassword,
  validatePasswordConfirmation,
} from "@/app/utils/authValidation";

export async function PATCH(req) {
  try {
    const auth = await getAuthUser(req);

    if (auth.error) {
      return jsonError(auth.error, auth.status);
    }

    const { currentPassword, newPassword, confirmPassword } = await req.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return jsonError("Semua field password harus diisi");
    }

    const passwordError =
      validateAuthPassword(newPassword, "Password baru") ||
      validatePasswordConfirmation(newPassword, confirmPassword);

    if (passwordError) return jsonError(passwordError);

    if (currentPassword === newPassword) {
      return jsonError("Password baru harus berbeda dari password saat ini");
    }

    const isValidPassword = await bcrypt.compare(
      currentPassword,
      auth.user.password,
    );

    if (!isValidPassword) {
      return jsonError("Password saat ini salah", 401);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(`UPDATE users SET password = $1 WHERE id = $2`, [
      hashedPassword,
      auth.user.id,
    ]);

    return NextResponse.json({
      success: true,
      message: "Password berhasil diperbarui",
    });
  } catch (err) {
    console.error("UPDATE ACCOUNT PASSWORD ERROR:", err);
    return jsonError("Gagal memperbarui password", 500);
  }
}
