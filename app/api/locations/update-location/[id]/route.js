import pool from "@/lib/dbConfig";

// UPDATE lokasi by id
export async function PUT(request, { params }) {
  try {
    const { id } = await params; // id dari URL
    const body = await request.json(); // data dari body
    const {
      location_name,
      address,
    } = body;

    // Validasi field wajib
    if (!location_name) {
      return new Response(
        JSON.stringify({ success: false, message: "Semua field wajib diisi!" }),
        { status: 400 }
      );
    }

    if (!address) {
      return new Response(
        JSON.stringify({ success: false, message: "Semua field wajib diisi!" }),
        { status: 400 }
      );
    }

    // Cek duplikasi Nama Lokasi
    const checkUser = await pool.query(
      `SELECT 1 FROM locations WHERE location_name = $1 AND id != $2`,
      [location_name, id]
    );
    if (checkUser.rows.length > 0) {
      return new Response(
        JSON.stringify({ success: false, message: "Lokasi sudah terdaftar!" }),
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE locations SET location_name=$1, address=$2 WHERE id=$3 RETURNING *`,
      [
        location_name,
        address,
        id,
      ]
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Berhasil mengubah data lokasi",
        data: result.rows[0],
      }),
      { status: 200 }
    );
  } catch (err) {
    console.log("error update location", err);
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500 }
    );
  }
}
