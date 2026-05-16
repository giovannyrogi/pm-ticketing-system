import { compareOTP } from "@/app/utils/otpUtils";
import {
  validateAuthPassword,
  validatePasswordConfirmation,
} from "@/app/utils/authValidation";
import pool from "@/lib/dbConfig";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import {
  findActiveUserByIdentifier,
  FORGOT_PASSWORD_OTP_TYPE,
  jsonError,
} from "../_utils";

export async function POST(req) {
  const client = await pool.connect();

  try {
    const { identifier, otpCode, newPassword, confirmPassword } =
      await req.json();

    if (!identifier?.trim()) {
      return jsonError("Email, username, atau nomor telepon harus diisi");
    }

    if (!otpCode || otpCode.length !== 6) {
      return jsonError("Kode OTP harus 6 digit");
    }

    const passwordValidation =
      validateAuthPassword(newPassword, "Password baru") ||
      validatePasswordConfirmation(newPassword, confirmPassword);

    if (passwordValidation) return jsonError(passwordValidation);

    const user = await findActiveUserByIdentifier(identifier);

    if (!user) {
      return jsonError("Akun tidak ditemukan atau tidak aktif", 404);
    }

    if (!user.phone_number) {
      return jsonError("Akun ini belum memiliki nomor WhatsApp terdaftar");
    }

    await client.query("BEGIN");

    const otpRes = await client.query(
      `
        SELECT *
        FROM otp_verifications
        WHERE phone_number = $1
        AND otp_type = $2
        AND is_verified = FALSE
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [user.phone_number, FORGOT_PASSWORD_OTP_TYPE],
    );

    if (otpRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return jsonError("OTP tidak ditemukan", 404);
    }

    const otpData = otpRes.rows[0];

    if (otpData.attempt_count >= 5) {
      await client.query("ROLLBACK");
      return jsonError(
        "Terlalu banyak percobaan OTP. Silahkan coba lagi 15 menit kemudian.",
        429,
      );
    }

    if (new Date() > new Date(otpData.expired_at)) {
      await client.query("ROLLBACK");
      return jsonError("Kode OTP sudah expired");
    }

    const isValidOtp = await compareOTP(otpCode, otpData.otp_code);

    if (!isValidOtp) {
      await client.query(
        `
          UPDATE otp_verifications
          SET attempt_count = attempt_count + 1
          WHERE id = $1
        `,
        [otpData.id],
      );

      await client.query("COMMIT");
      return jsonError("Kode OTP tidak valid");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await client.query(
      `
        UPDATE users
        SET password = $1
        WHERE id = $2
      `,
      [hashedPassword, user.id],
    );

    await client.query(
      `
        UPDATE otp_verifications
        SET is_verified = TRUE
        WHERE id = $1
      `,
      [otpData.id],
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Password berhasil direset. Silakan login dengan password baru.",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("FORGOT PASSWORD RESET ERROR:", err);
    return jsonError("Gagal mereset password", 500);
  } finally {
    client.release();
  }
}
