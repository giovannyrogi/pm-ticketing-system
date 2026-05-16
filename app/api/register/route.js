import pool from "@/lib/dbConfig";
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
import bcrypt from "bcryptjs";
const { NextResponse } = require("next/server");

export async function POST(req) {
  try {
    const { fullName, username, password, email, phoneNumber } =
      await req.json();

    /**
     * ===============================
     * SANITIZE INPUT
     * ===============================
     */
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
        { message: validationMessage },
        { status: 400 },
      );
    }

    if (!phoneNumber) {
      return NextResponse.json(
        { message: "Nomor Telepon harus diisi" },
        { status: 400 },
      );
    }

    /**
     * ===============================
     * PHONE FORMAT VALIDATION
     * ===============================
     */
    if (!phoneRegex.test(sanitizedPhoneNumber)) {
      return NextResponse.json(
        {
          message:
            "Nomor telepon harus diawali angka 8 dan terdiri dari 10-14 digit",
        },
        { status: 400 },
      );
    }

    // Cek apakah user terdaftar
    const userRes = await pool.query(
      `SELECT id, full_name, username, password, role, email, phone_number, is_active
       FROM users WHERE username = $1`,
      [sanitizedUsername],
    );

    if (userRes.rows.length > 0) {
      return NextResponse.json(
        { message: "Username sudah terdaftar" },
        { status: 400 },
      );
    }

    // cek duplicat email
    const emailRes = await pool.query(
      `SELECT id, full_name, username, password, role, email, phone_number, is_active
       FROM users WHERE email = $1`,
      [sanitizedEmail],
    );

    if (emailRes.rows.length > 0) {
      return NextResponse.json(
        { message: "Email sudah terdaftar" },
        { status: 400 },
      );
    }

    const phoneRes = await pool.query(
      `SELECT id
       FROM users
       WHERE phone_number = $1`,
      [sanitizedPhoneNumber],
    );

    if (phoneRes.rows.length > 0) {
      return NextResponse.json(
        { message: "Nomor telepon sudah terdaftar" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru ke database
    const user = await pool.query(
      `INSERT INTO users (full_name, username, password, role, email, phone_number, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
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

    const response = NextResponse.json(
      {
        success: true,
        message: "Registrasi berhasil",
        data: user.rows[0],
      },
      { status: 200 },
    );

    return response;
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { message: "Registrasi gagal", error: error.message },
      { status: 500 },
    );
  }
}
