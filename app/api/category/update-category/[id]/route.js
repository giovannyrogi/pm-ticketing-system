import pool from "@/lib/dbConfig";

// UPDATE Category by id
export async function PUT(request, { params }) {
  try {
    const { id } = await params; // id dari URL
    const body = await request.json(); // data dari body
    const { category_name } = body;

    // Validasi field wajib
    if (!category_name) {
      return new Response(
        JSON.stringify({ success: false, message: "Semua field wajib diisi!" }),
        { status: 400 },
      );
    }

    // Cek duplikasi Nama Category
    const checkCategory = await pool.query(
      `SELECT 1 FROM categories WHERE category_name = $1 AND id != $2`,
      [category_name, id],
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
      `UPDATE categories SET category_name=$1 WHERE id=$2 RETURNING *`,
      [category_name, id],
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Berhasil mengubah data Category",
        data: result.rows[0],
      }),
      { status: 200 },
    );
  } catch (err) {
    console.log("error update category", err);
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500 },
    );
  }
}
