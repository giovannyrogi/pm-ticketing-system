import pool from "@/lib/dbConfig";
import bcrypt from "bcryptjs";
import { generateOTP, hashOTP } from "@/app/utils/otpUtils";
import { sendWhatsappOTP } from "@/app/utils/whatsappService";
import {
  phoneRegex,
  sanitizePhoneNumber,
} from "@/app/utils/validationTextField";
import { getAuthUser, jsonError } from "../../_utils";
import { NextResponse } from "next/server";

const OTP_TYPE = "profile_phone";

export async function POST(req) {
  try {
    const auth = await getAuthUser(req);

    if (auth.error) {
      return jsonError(auth.error, auth.status);
    }

    const { phoneNumber, currentPassword } = await req.json();
    const sanitizedPhoneNumber = sanitizePhoneNumber(phoneNumber);

    if (!currentPassword) {
      return jsonError("Password saat ini harus diisi");
    }

    if (!sanitizedPhoneNumber) {
      return jsonError("Nomor telepon baru harus diisi");
    }

    if (!phoneRegex.test(sanitizedPhoneNumber)) {
      return jsonError("Nomor telepon tidak valid");
    }

    if (sanitizedPhoneNumber === auth.user.phone_number) {
      return jsonError("Nomor telepon baru harus berbeda dari nomor saat ini");
    }

    const isValidPassword = await bcrypt.compare(
      currentPassword,
      auth.user.password,
    );

    if (!isValidPassword) {
      return jsonError("Password saat ini salah", 401);
    }

    const duplicateRes = await pool.query(
      `SELECT id FROM users WHERE phone_number = $1 AND id <> $2 LIMIT 1`,
      [sanitizedPhoneNumber, auth.user.id],
    );

    if (duplicateRes.rowCount > 0) {
      return jsonError("Nomor telepon sudah digunakan");
    }

    const latestOtpRes = await pool.query(
      `
        SELECT *
        FROM otp_verifications
        WHERE phone_number = $1
        AND otp_type = $2
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [sanitizedPhoneNumber, OTP_TYPE],
    );

    const latestOtp = latestOtpRes.rows[0];

    if (latestOtp && latestOtp.attempt_count >= 5) {
      const blockedUntil = new Date(latestOtp.created_at);
      blockedUntil.setMinutes(blockedUntil.getMinutes() + 15);

      if (new Date() < blockedUntil) {
        return jsonError(
          "Terlalu banyak percobaan OTP. Silahkan coba lagi 15 menit kemudian.",
          429,
        );
      }
    }

    if (
      latestOtp &&
      !latestOtp.is_verified &&
      latestOtp.resend_available_at &&
      new Date() < new Date(latestOtp.resend_available_at)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Kode OTP masih aktif. Silakan gunakan kode yang telah dikirim ke WhatsApp Anda.",
          expiredAt: latestOtp.expired_at,
          resendAvailableAt: latestOtp.resend_available_at,
        },
        { status: 429 },
      );
    }

    const otpCode = generateOTP();
    const hashedOtp = await hashOTP(otpCode);
    const expiredAt = new Date();
    expiredAt.setMinutes(expiredAt.getMinutes() + 5);

    const resendAvailableAt = new Date();
    resendAvailableAt.setMinutes(resendAvailableAt.getMinutes() + 5);

    await sendWhatsappOTP({
      phoneNumber: `62${sanitizedPhoneNumber}`,
      otpCode,
    });

    await pool.query(
      `
        UPDATE otp_verifications
        SET is_verified = TRUE
        WHERE phone_number = $1
        AND otp_type = $2
        AND is_verified = FALSE
      `,
      [sanitizedPhoneNumber, OTP_TYPE],
    );

    await pool.query(
      `
        INSERT INTO otp_verifications
        (
          phone_number,
          otp_code,
          otp_type,
          expired_at,
          resend_available_at
        )
        VALUES ($1, $2, $3, $4, $5)
      `,
      [sanitizedPhoneNumber, hashedOtp, OTP_TYPE, expiredAt, resendAvailableAt],
    );

    return NextResponse.json({
      success: true,
      message: "Kode OTP berhasil dikirim",
      expiredAt,
      resendAvailableAt,
    });
  } catch (err) {
    console.error("SEND ACCOUNT PHONE OTP ERROR:", err);
    return jsonError("Gagal mengirim OTP", 500);
  }
}
