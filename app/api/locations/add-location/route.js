import pool from "@/lib/dbConfig";
import moment from "moment";

// CREATE lokasi
export async function POST(req) {
  try {
    const body = await req.json();
    const { location_name, address } = body;

    // Validasi field wajib
    if (!location_name) {
      return new Response(
        JSON.stringify({ success: false, message: "Nama Lokasi wajib diisi!" }),
        { status: 400 },
      );
    }

    if (!address) {
      return new Response(
        JSON.stringify({ success: false, message: "Nama Jalan wajib diisi!" }),
        { status: 400 },
      );
    }

    // Cek duplikasi Nama Lokasi
    const checkUser = await pool.query(
      `SELECT 1 FROM locations WHERE location_name = $1`,
      [location_name],
    );
    if (checkUser.rows.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Lokasi sudah terdaftar!",
        }),
        { status: 400 },
      );
    }

    const result = await pool.query(
      `INSERT INTO locations (location_name, address)
       VALUES ($1, $2 ) RETURNING *`,
      [location_name, address],
    );
    return new Response(
      JSON.stringify({
        success: true,
        message: "Berhasil menambah lokasi baru",
        data: result.rows[0],
      }),
      { status: 201 },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500 },
    );
  }
}
