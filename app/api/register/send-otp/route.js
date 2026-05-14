import pool from "@/lib/dbConfig";

import {
  emailRegex,
  phoneRegex,
  sanitizePhoneNumber,
} from "@/app/utils/validationTextField";

import { generateOTP, hashOTP, getOTPExpiredTime } from "@/app/utils/otpUtils";

import { sendWhatsappOTP } from "@/app/utils/whatsappService";

import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { fullName, username, password, email, phoneNumber } =
      await req.json();

    /**
     * ===============================
     * SANITIZE
     * ===============================
     */
    const sanitizedEmail = email?.trim().toLowerCase();

    const sanitizedPhoneNumber = sanitizePhoneNumber(phoneNumber);

    /**
     * ===============================
     * REQUIRED VALIDATION
     * ===============================
     */
    if (!fullName) {
      return NextResponse.json(
        {
          message: "Nama lengkap harus diisi",
        },
        { status: 400 },
      );
    }

    if (!username) {
      return NextResponse.json(
        {
          message: "Username harus diisi",
        },
        { status: 400 },
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          message: "Password harus diisi",
        },
        { status: 400 },
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          message: "Email harus diisi",
        },
        { status: 400 },
      );
    }

    if (!phoneNumber) {
      return NextResponse.json(
        {
          message: "Nomor telepon harus diisi",
        },
        { status: 400 },
      );
    }

    /**
     * ===============================
     * EMAIL VALIDATION
     * ===============================
     */
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json(
        {
          message: "Format email tidak valid",
        },
        { status: 400 },
      );
    }

    /**
     * ===============================
     * PHONE VALIDATION
     * ===============================
     */
    if (!phoneRegex.test(sanitizedPhoneNumber)) {
      return NextResponse.json(
        {
          message: "Nomor telepon tidak valid",
        },
        { status: 400 },
      );
    }

    /**
     * ===============================
     * DUPLICATE USERNAME
     * ===============================
     */
    const usernameRes = await pool.query(
      `
        SELECT id
        FROM users
        WHERE username = $1
      `,
      [username],
    );

    if (usernameRes.rows.length > 0) {
      return NextResponse.json(
        {
          message: "Username sudah digunakan",
        },
        { status: 400 },
      );
    }

    /**
     * ===============================
     * DUPLICATE EMAIL
     * ===============================
     */
    const emailRes = await pool.query(
      `
        SELECT id
        FROM users
        WHERE email = $1
      `,
      [sanitizedEmail],
    );

    if (emailRes.rows.length > 0) {
      return NextResponse.json(
        {
          message: "Email sudah digunakan",
        },
        { status: 400 },
      );
    }

    /**
     * ===============================
     * MAX ATTEMPT CHECK
     * ===============================
     */
    const otpRes = await pool.query(
      `
      SELECT *
      FROM otp_verifications
      WHERE phone_number = $1
      ORDER BY created_at DESC
      LIMIT 1
    `,
      [sanitizedPhoneNumber],
    );

    const latestOtp = otpRes.rows[0];

    if (latestOtp && latestOtp.attempt_count >= 5) {
      const blockedUntil = new Date(latestOtp.created_at);

      blockedUntil.setMinutes(blockedUntil.getMinutes() + 15);

      if (new Date() < blockedUntil) {
        return NextResponse.json(
          {
            message:
              "Terlalu banyak percobaan OTP. Silahkan coba lagi 15 menit kemudian.",
          },
          { status: 429 },
        );
      }
    }

    /**
     * ===============================
     * REUSE ACTIVE OTP
     * ===============================
     */
    const activeOtpRes = await pool.query(
      `
      SELECT *
      FROM otp_verifications
      WHERE
        phone_number = $1
        AND is_verified = FALSE
      ORDER BY created_at DESC
      LIMIT 1
    `,
      [sanitizedPhoneNumber],
    );

    const activeOtp = activeOtpRes.rows[0];

    if (activeOtp) {
      /**
       * ===============================
       * OTP STILL ACTIVE
       * ===============================
       */
      if (new Date() < new Date(activeOtp.expired_at)) {
        /**
         * ===============================
         * RESEND COOLDOWN
         * ===============================
         */
        if (
          activeOtp.resend_available_at &&
          new Date() < new Date(activeOtp.resend_available_at)
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Kode OTP masih aktif. Silakan gunakan kode yang telah dikirim ke WhatsApp Anda.",

              expiredAt: activeOtp.expired_at,

              resendAvailableAt: activeOtp.resend_available_at,
            },
            { status: 429 },
          );
        }
      }
    }

    /**
     * ===============================
     * GENERATE OTP
     * ===============================
     */
    const otpCode = generateOTP();

    const hashedOtp = await hashOTP(otpCode);

    const expiredAt = new Date();

    expiredAt.setMinutes(expiredAt.getMinutes() + 5);

    const resendAvailableAt = new Date();

    resendAvailableAt.setMinutes(resendAvailableAt.getMinutes() + 5);

    /**
     * ===============================
     * SEND WHATSAPP OTP
     * ===============================
     */
    await sendWhatsappOTP({
      phoneNumber: `62${sanitizedPhoneNumber}`,
      otpCode,
    });

    /**
     * ===============================
     * INVALIDATE OLD OTP
     * ===============================
     */
    await pool.query(
      `
        UPDATE otp_verifications
        SET is_verified = TRUE
        WHERE
        phone_number = $1
        AND is_verified = FALSE
    `,
      [sanitizedPhoneNumber],
    );

    /**
     * ===============================
     * INSERT OTP
     * ===============================
     */
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
        VALUES ($1,$2,$3,$4,$5)
    `,
      [
        sanitizedPhoneNumber,
        hashedOtp,
        "register",
        expiredAt,
        resendAvailableAt,
      ],
    );

    return NextResponse.json({
      success: true,
      message: "Kode OTP berhasil dikirim",

      expiredAt,

      resendAvailableAt,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Gagal mengirim OTP",
      },
      { status: 500 },
    );
  }
}
