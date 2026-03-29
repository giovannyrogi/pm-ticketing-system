import pool from "@/lib/dbConfig";
import bcrypt from "bcryptjs";
const { NextResponse } = require("next/server");

export async function POST(req) {
  try {
    const { fullName, username, password, email, phoneNumber } =
      await req.json();

    console.log("full_name", fullName);
    console.log("username", username);
    console.log("password", password);
    console.log("email", email);
    console.log("phone_number", phoneNumber);

    if (!username) {
      return NextResponse.json(
        { message: "Username harus diisi" },
        { status: 400 },
      );
    }

    if (!password) {
      return NextResponse.json(
        { message: "Password harus diisi" },
        { status: 400 },
      );
    }

    if (!email) {
      return NextResponse.json(
        { message: "Email harus diisi" },
        { status: 400 },
      );
    }

    if (!phoneNumber) {
      return NextResponse.json(
        { message: "Nomor Telepon harus diisi" },
        { status: 400 },
      );
    }

    // Cek apakah user terdaftar
    const userRes = await pool.query(
      `SELECT id, full_name, username, password, role, email, phone_number, is_active
       FROM users WHERE username = $1`,
      [username],
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
      [email],
    );

    if (emailRes.rows.length > 0) {
      return NextResponse.json(
        { message: "Email sudah terdaftar" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru ke database
    const user = await pool.query(
      `INSERT INTO users (full_name, username, password, role, email, phone_number, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [fullName, username, hashedPassword, "user", email, phoneNumber, true],
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
