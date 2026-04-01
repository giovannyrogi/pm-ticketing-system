import pool from "@/lib/dbConfig";
import moment from "moment";

// CREATE lokasi
export async function POST(req) {
  try {
    const body = await req.json();
    const { category_name } = body;

    console.log("category_name", category_name);

    // Validasi field wajib
    if (!category_name) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Nama Category wajib diisi!",
        }),
        { status: 400 },
      );
    }

    // Cek duplikasi Nama Category
    const checkCategory = await pool.query(
      `SELECT 1 FROM categories WHERE category_name = $1`,
      [category_name],
    );
    if (checkCategory.rows.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Category sudah terdaftar!",
        }),
        { status: 400 },
      );
    }

    const result = await pool.query(
      `INSERT INTO categories (category_name)
       VALUES ($1 ) RETURNING *`,
      [category_name],
    );
    return new Response(
      JSON.stringify({
        success: true,
        message: "Berhasil menambah category baru",
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
