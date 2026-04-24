import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const CONTENT_TYPE_MAP = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

const ALLOWED_ROOTS = ["tickets", "messages"];

export async function GET(request, context) {
  try {
    /**
     * ===============================
     * FIX PARAMS (WAJIB)
     * ===============================
     */
    const { params } = context;
    const resolvedParams = await params;

    if (!resolvedParams?.path || !Array.isArray(resolvedParams.path)) {
      return new NextResponse("Invalid path", { status: 400 });
    }

    /**
     * ===============================
     * VALIDASI ROOT
     * ===============================
     */
    const rootFolder = resolvedParams.path[0];

    if (!ALLOWED_ROOTS.includes(rootFolder)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    /**
     * ===============================
     * SAFE PATH
     * ===============================
     */
    const safePath = path.normalize(
      path.join(UPLOAD_DIR, ...resolvedParams.path)
    );

    if (!safePath.startsWith(UPLOAD_DIR)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    /**
     * ===============================
     * CHECK FILE
     * ===============================
     */
    if (!fs.existsSync(safePath)) {
      return new NextResponse("File not found", { status: 404 });
    }

    /**
     * ===============================
     * EXT VALIDATION
     * ===============================
     */
    const ext = path.extname(safePath).toLowerCase();

    if (!CONTENT_TYPE_MAP[ext]) {
      return new NextResponse("Unsupported file type", { status: 415 });
    }

    /**
     * ===============================
     * READ FILE
     * ===============================
     */
    const fileBuffer = await fs.promises.readFile(safePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": CONTENT_TYPE_MAP[ext],
        "Content-Security-Policy": "default-src 'none'",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("UPLOAD API ERROR:", error);

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}