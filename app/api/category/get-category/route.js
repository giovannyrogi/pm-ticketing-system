import pool from "@/lib/dbConfig";
import moment from "moment";

// READ Data Category
export async function GET(req) {
  try {
    const result = await pool.query(
      `SELECT * FROM categories ORDER BY created_at ASC`
    );
    const rows = result.rows.map((row) => ({
      id: row.id,
      category_name: row.category_name,
      description: row.description,
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
        message: "Berhasil mengambil data kategori",
        data: rows,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("error get category", err);
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500 }
    );
  }
}
