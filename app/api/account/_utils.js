import pool from "@/lib/dbConfig";
import { NextResponse } from "next/server";

export const PROFILE_SELECT = `
  id,
  full_name,
  username,
  role,
  email,
  phone_number,
  is_active
`;

export const getAuthUser = async (req) => {
  const cookie = req.cookies.get("dataUser");

  if (!cookie?.value) {
    return { error: "Sesi tidak ditemukan", status: 401 };
  }

  let cookieUser;

  try {
    cookieUser = JSON.parse(cookie.value);
  } catch {
    return { error: "Sesi tidak valid", status: 401 };
  }

  if (!cookieUser?.id) {
    return { error: "Sesi tidak valid", status: 401 };
  }

  if (cookieUser.expiresAt && cookieUser.expiresAt < Date.now()) {
    return { error: "Sesi sudah berakhir", status: 401 };
  }

  const userRes = await pool.query(
    `SELECT ${PROFILE_SELECT}, password FROM users WHERE id = $1 LIMIT 1`,
    [cookieUser.id],
  );

  if (userRes.rowCount === 0) {
    return { error: "User tidak ditemukan", status: 404 };
  }

  const user = userRes.rows[0];

  if (!user.is_active) {
    return { error: "Akun tidak aktif", status: 403 };
  }

  return { user };
};

export const toPublicUser = (user) => ({
  id: user.id,
  full_name: user.full_name,
  username: user.username,
  role: user.role,
  email: user.email,
  phone_number: user.phone_number,
  is_active: user.is_active,
});

export const jsonError = (message, status = 400) =>
  NextResponse.json({ success: false, message }, { status });
