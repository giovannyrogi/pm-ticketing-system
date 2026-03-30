import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const response = NextResponse.json({ success: true, message: "Logout berhasil" });
    response.cookies.set("dataUser", "", {
      expires: new Date(0),
      path: "/",
    });
    return response;
  } catch (err) {
    console.error("Error saat logout:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat logout", error: err.message },
      { status: 500 }
    );
  }
}
