import { NextResponse } from "next/server";
import {
  findActiveUserByIdentifier,
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

    return NextResponse.json({
      success: true,
      message: "Akun ditemukan",
      data: toForgotPasswordPublicUser(user),
    });
  } catch (err) {
    console.error("FORGOT PASSWORD LOOKUP ERROR:", err);
    return jsonError("Gagal mencari akun", 500);
  }
}
