import pool from "@/lib/dbConfig";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

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

    // Cek apakah user terdaftar
    const userRes = await pool.query(
      `SELECT id, full_name, username, password, role, email, phone_number, is_active
       FROM users WHERE username = $1`,
      [username],
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { message: "Username belum terdaftar" },
        { status: 400 },
      );
    }

    const user = userRes.rows[0];

    // Cek password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ message: "Password salah" }, { status: 401 });
    }

    // Cek status aktif
    if (!user.is_active) {
      if (user.role === "user") {
        return NextResponse.json(
          { message: "User tidak aktif, silakan hubungi admin" },
          { status: 403 },
        );
      } else {
        return NextResponse.json(
          { message: "User tidak aktif, silakan hubungi superadmin" },
          { status: 403 },
        );
      }
    }

    delete user.password;

    const SESSION_DURATION_MINUTES = 540;
    const expiresAt = Date.now() + SESSION_DURATION_MINUTES * 60 * 1000;

    const response = NextResponse.json(
      {
        data: user,
        success: true,
        message: `Login berhasil`,
      },
      { status: 200 },
    );

    // Simpan cookies
    response.cookies.set("dataUser", JSON.stringify({ ...user, expiresAt }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
