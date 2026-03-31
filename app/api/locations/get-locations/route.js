import pool from "@/lib/dbConfig";
import moment from "moment";

// READ Data Location
export async function GET(req) {
  try {
    const result = await pool.query(
      `SELECT * FROM locations ORDER BY created_at DESC`
    );
    const rows = result.rows.map((row) => ({
      id: row.id,
      location_name: row.location_name,
      address: row.address,
      updated_at: row.updated_at
        ? moment(row.updated_at).format("YYYY-MM-DD HH:mm:ss")
        : null,
      created_at: row.created_at
        ? moment(row.created_at).format("YYYY-MM-DD HH:mm:ss")
        : null,
    }));
    return new Response(
      JSON.stringify({
        success: true,
        message: "Berhasil mengambil data lokasi",
        data: rows,
      }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500 }
    );
  }
}
