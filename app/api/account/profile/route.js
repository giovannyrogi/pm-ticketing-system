import { getAuthUser, jsonError, toPublicUser } from "../_utils";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const auth = await getAuthUser(req);

    if (auth.error) {
      return jsonError(auth.error, auth.status);
    }

    return NextResponse.json({
      success: true,
      data: toPublicUser(auth.user),
    });
  } catch (err) {
    console.error("GET ACCOUNT PROFILE ERROR:", err);
    return jsonError("Gagal mengambil data profil", 500);
  }
}
