import pool from "@/lib/dbConfig";

import bcrypt from "bcryptjs";

import { compareOTP } from "@/app/utils/otpUtils";

import {
  phoneRegex,
  sanitizePhoneNumber,
} from "@/app/utils/validationTextField";
import {
  validateAuthEmail,
  validateAuthPassword,
  validateFullName,
  validateUsername,
} from "@/app/utils/authValidation";

import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { fullName, username, password, email, phoneNumber, otpCode } =
      await req.json();

    const sanitizedFullName = String(fullName ?? "").trim();

    const sanitizedUsername = String(username ?? "").trim();

    const sanitizedEmail = String(email ?? "").trim().toLowerCase();

    const sanitizedPhoneNumber = sanitizePhoneNumber(phoneNumber);

    const validationMessage =
      validateFullName(sanitizedFullName) ||
      validateUsername(sanitizedUsername) ||
      validateAuthPassword(password) ||
      validateAuthEmail(sanitizedEmail);

    if (validationMessage) {
      return NextResponse.json(
        {
          message: validationMessage,
        },
        { status: 400 },
      );
    }

    if (!phoneRegex.test(sanitizedPhoneNumber)) {
      return NextResponse.json(
        {
          message:
            "Nomor telepon harus diawali angka 8 dan terdiri dari 10-14 digit",
        },
        { status: 400 },
      );
    }

    /**
     * ===============================
     * GET OTP
     * ===============================
     */
    const otpRes = await pool.query(
      `
      SELECT *
      FROM otp_verifications
      WHERE phone_number = $1
      AND is_verified = FALSE
      ORDER BY created_at DESC
      LIMIT 1
    `,
      [sanitizedPhoneNumber],
    );

    if (otpRes.rows.length === 0) {
      return NextResponse.json(
        {
          message: "OTP tidak ditemukan",
        },
        { status: 404 },
      );
    }

    const otpData = otpRes.rows[0];

    /**
     * ===============================
     * OTP ALREADY VERIFIED
     * ===============================
     */
    if (otpData.is_verified) {
      return NextResponse.json(
        {
          message: "Kode OTP sudah digunakan",
        },
        { status: 400 },
      );
    }

    /**
     * ===============================
     * MAX ATTEMPT
     * ===============================
     */
    if (otpData.attempt_count >= 5) {
      return NextResponse.json(
        {
          message:
            "Terlalu banyak percobaan OTP. Silahkan coba lagi 15 menit kemudian.",
        },
        { status: 429 },
      );
    }

    /**
     * ===============================
     * EXPIRED
     * ===============================
     */
    if (new Date() > new Date(otpData.expired_at)) {
      return NextResponse.json(
        {
          message: "Kode OTP sudah expired",
        },
        { status: 400 },
      );
    }

    /**
     * ===============================
     * COMPARE OTP
     * ===============================
     */
    const isValidOtp = await compareOTP(otpCode, otpData.otp_code);

    if (!isValidOtp) {
      await pool.query(
        `
        UPDATE otp_verifications
        SET attempt_count = attempt_count + 1
        WHERE id = $1
      `,
        [otpData.id],
      );

      return NextResponse.json(
        {
          message: "Kode OTP tidak valid",
        },
        { status: 400 },
      );
    }

    const duplicateUser = await pool.query(
      `
        SELECT id
        FROM users
        WHERE username = $1
        OR email = $2
        OR phone_number = $3
        LIMIT 1
      `,
      [sanitizedUsername, sanitizedEmail, sanitizedPhoneNumber],
    );

    if (duplicateUser.rows.length > 0) {
      return NextResponse.json(
        {
          message: "Username, email, atau nomor telepon sudah digunakan",
        },
        { status: 400 },
      );
    }

    /**
     * ===============================
     * HASH PASSWORD
     * ===============================
     */
    const hashedPassword = await bcrypt.hash(password, 10);

    /**
     * ===============================
     * INSERT USER
     * ===============================
     */
    const user = await pool.query(
      `
        INSERT INTO users
        (
          full_name,
          username,
          password,
          role,
          email,
          phone_number,
          is_active
        )
        VALUES
        ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *
      `,
      [
        sanitizedFullName,
        sanitizedUsername,
        hashedPassword,
        "user",
        sanitizedEmail,
        sanitizedPhoneNumber,
        true,
      ],
    );

    /**
     * ===============================
     * DELETE OTP
     * ===============================
     */
    // await pool.query(
    //   `
    //   DELETE FROM otp_verifications
    //   WHERE id = $1
    // `,
    //   [otpData.id],
    // );

    /**
     * ===============================
     * MARK OTP VERIFIED
     * ===============================
     */
    await pool.query(
      `
        UPDATE otp_verifications
        SET
          is_verified = TRUE
        WHERE id = $1
      `,
      [otpData.id],
    );

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil",
      data: user.rows[0],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Verifikasi OTP gagal",
      },
      { status: 500 },
    );
  }
}
