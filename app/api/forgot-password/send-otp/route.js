import { generateOTP, hashOTP } from "@/app/utils/otpUtils";
import { sendWhatsappOTP } from "@/app/utils/whatsappService";
import pool from "@/lib/dbConfig";
import { NextResponse } from "next/server";
import {
  findActiveUserByIdentifier,
  FORGOT_PASSWORD_OTP_TYPE,
  jsonError,
  toForgotPasswordPublicUser,
} from "../_utils";

export async function POST(req) {
  try {
    const { identifier } = await req.json();

    if (!identifier?.trim()) {
      return jsonError("Email, username, atau nomor telepon harus diisi");
    }

    const user = await findActiveUserByIdentifier(identifier);

    if (!user) {
      return jsonError("Akun tidak ditemukan atau tidak aktif", 404);
    }

    if (!user.phone_number) {
      return jsonError("Akun ini belum memiliki nomor WhatsApp terdaftar");
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
      [user.phone_number, FORGOT_PASSWORD_OTP_TYPE],
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
      return jsonError(
        "Kode OTP masih aktif. Silakan gunakan kode yang telah dikirim ke WhatsApp Anda.",
        429,
        {
          data: toForgotPasswordPublicUser(user),
          expiredAt: latestOtp.expired_at,
          resendAvailableAt: latestOtp.resend_available_at,
        },
      );
    }

    const otpCode = generateOTP();
    const hashedOtp = await hashOTP(otpCode);
    const expiredAt = new Date();
    expiredAt.setMinutes(expiredAt.getMinutes() + 5);

    const resendAvailableAt = new Date();
    resendAvailableAt.setMinutes(resendAvailableAt.getMinutes() + 5);

    await sendWhatsappOTP({
      phoneNumber: `62${user.phone_number}`,
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
      [user.phone_number, FORGOT_PASSWORD_OTP_TYPE],
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
      [
        user.phone_number,
        hashedOtp,
        FORGOT_PASSWORD_OTP_TYPE,
        expiredAt,
        resendAvailableAt,
      ],
    );

    return NextResponse.json({
      success: true,
      message: "Kode OTP berhasil dikirim",
      data: toForgotPasswordPublicUser(user),
      expiredAt,
      resendAvailableAt,
    });
  } catch (err) {
    console.error("FORGOT PASSWORD SEND OTP ERROR:", err);
    return jsonError("Gagal mengirim OTP", 500);
  }
}
