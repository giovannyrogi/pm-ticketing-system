import pool from "@/lib/dbConfig";
import { compareOTP } from "@/app/utils/otpUtils";
import {
  phoneRegex,
  sanitizePhoneNumber,
} from "@/app/utils/validationTextField";
import { getAuthUser, jsonError, toPublicUser } from "../../_utils";
import { NextResponse } from "next/server";

const OTP_TYPE = "profile_phone";

export async function POST(req) {
  const client = await pool.connect();

  try {
    const auth = await getAuthUser(req);

    if (auth.error) {
      return jsonError(auth.error, auth.status);
    }

    const { phoneNumber, otpCode } = await req.json();
    const sanitizedPhoneNumber = sanitizePhoneNumber(phoneNumber);

    if (!sanitizedPhoneNumber) {
      return jsonError("Nomor telepon baru harus diisi");
    }

    if (!phoneRegex.test(sanitizedPhoneNumber)) {
      return jsonError("Nomor telepon tidak valid");
    }

    if (!otpCode || otpCode.length !== 6) {
      return jsonError("Kode OTP harus 6 digit");
    }

    await client.query("BEGIN");

    const duplicateRes = await client.query(
      `SELECT id FROM users WHERE phone_number = $1 AND id <> $2 LIMIT 1`,
      [sanitizedPhoneNumber, auth.user.id],
    );

    if (duplicateRes.rowCount > 0) {
      await client.query("ROLLBACK");
      return jsonError("Nomor telepon sudah digunakan");
    }

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
      [sanitizedPhoneNumber, OTP_TYPE],
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

    await client.query(
      `
        UPDATE otp_verifications
        SET is_verified = TRUE
        WHERE id = $1
      `,
      [otpData.id],
    );

    const updatedRes = await client.query(
      `
        UPDATE users
        SET phone_number = $1
        WHERE id = $2
        RETURNING id, full_name, username, role, email, phone_number, is_active
      `,
      [sanitizedPhoneNumber, auth.user.id],
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Nomor telepon berhasil diperbarui",
      data: toPublicUser(updatedRes.rows[0]),
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("VERIFY ACCOUNT PHONE OTP ERROR:", err);
    return jsonError("Verifikasi OTP gagal", 500);
  } finally {
    client.release();
  }
}
