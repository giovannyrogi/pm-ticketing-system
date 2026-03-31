import pool from "@/lib/dbConfig";

// DELETE lokasi by id
export async function DELETE(request, context) {
  const { id } = await context.params;

  try {
    const result = await pool.query(
      `DELETE FROM locations WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Lokasi tidak ditemukan atau sudah dihapus.",
        }),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Berhasil menghapus lokasi." }),
      { status: 200 }
    );
  } catch (err) {
    console.error("error delete location", err);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Gagal menghapus lokasi. Silakan coba lagi.",
        error: err.message,
      }),
      { status: 500 }
    );
  }
}
