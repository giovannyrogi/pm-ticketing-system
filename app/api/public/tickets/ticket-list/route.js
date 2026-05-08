import formatTimeAgo from "@/app/utils/formatTime";
import pool from "@/lib/dbConfig";

const SORT_OPTIONS = {
  newest: "t.published_at DESC NULLS LAST, t.created_at DESC",
  oldest: "t.published_at ASC NULLS LAST, t.created_at ASC",
  popular: "COALESCE(ts.views_count, 0) DESC, t.published_at DESC NULLS LAST",
  liked: "COALESCE(ts.likes_count, 0) DESC, t.published_at DESC NULLS LAST",
};

export async function GET(req) {
  const client = await pool.connect();

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const categoryId = searchParams.get("category") || "all";
    const sort = searchParams.get("sort") || "newest";

    const values = [];
    const filters = ["t.is_public = TRUE", "t.status = 'selesai'"];

    if (search) {
      values.push(`%${search}%`);
      filters.push(`
        (
          t.ticket_title ILIKE $${values.length}
          OR t.ticket_description ILIKE $${values.length}
          OR t.ticket_code ILIKE $${values.length}
          OR c.category_name ILIKE $${values.length}
          OR l.location_name ILIKE $${values.length}
        )
      `);
    }

    if (categoryId !== "all" && !isNaN(Number(categoryId))) {
      values.push(Number(categoryId));
      filters.push(`t.category_id = $${values.length}`);
    }

    const orderBy = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;

    const ticketsResult = await client.query(
      `
        SELECT
          t.id,
          t.ticket_code,
          t.ticket_title,
          t.ticket_description,
          t.status,
          t.priority,
          t.created_at,
          t.published_at,
          t.completed_at,
          t.is_public,

          u.id as user_id,
          u.full_name as user_name,

          a.id as admin_id,
          a.full_name as admin_name,

          c.id as category_id,
          c.category_name,

          l.id as location_id,
          l.location_name,

          ts.views_count,
          ts.likes_count,

          (
            SELECT att.image_url
            FROM attachments att
            WHERE att.ticket_id = t.id
            AND att.message_id IS NULL
            ORDER BY att.id ASC
            LIMIT 1
          ) as thumbnail_url

        FROM tickets t

        LEFT JOIN users u
          ON t.created_by = u.id

        LEFT JOIN users a
          ON t.assigned_to = a.id

        LEFT JOIN categories c
          ON t.category_id = c.id

        LEFT JOIN locations l
          ON t.location_id = l.id

        LEFT JOIN ticket_stats ts
          ON ts.ticket_id = t.id

        WHERE ${filters.join(" AND ")}

        ORDER BY ${orderBy}
      `,
      values,
    );

    const categoriesResult = await client.query(
      `
        SELECT DISTINCT
          c.id,
          c.category_name
        FROM tickets t
        INNER JOIN categories c
          ON t.category_id = c.id
        WHERE t.is_public = TRUE
        AND t.status = 'selesai'
        ORDER BY c.category_name ASC
      `,
    );

    const data = ticketsResult.rows.map((row) => ({
      id: row.id,
      ticket_code: row.ticket_code,
      ticket_title: row.ticket_title,
      ticket_description: row.ticket_description,
      status: row.status,
      priority: row.priority,
      is_public: row.is_public,
      created_at: row.created_at,
      created_at_human: formatTimeAgo(row.created_at),
      published_at: row.published_at,
      published_at_human: row.published_at
        ? formatTimeAgo(row.published_at)
        : null,
      completed_at: row.completed_at,
      completed_at_human: row.completed_at
        ? formatTimeAgo(row.completed_at)
        : null,
      user: {
        id: row.user_id,
        name: row.user_name,
      },
      admin: row.admin_id
        ? {
            id: row.admin_id,
            name: row.admin_name,
          }
        : null,
      category: {
        id: row.category_id,
        name: row.category_name,
      },
      location: {
        id: row.location_id,
        name: row.location_name,
      },
      stats: {
        views: row.views_count || 0,
        likes: row.likes_count || 0,
      },
      thumbnail_url: row.thumbnail_url || null,
    }));

    return Response.json({
      success: true,
      message: "Berhasil mengambil tiket publik",
      data,
      filters: {
        categories: categoriesResult.rows.map((row) => ({
          id: row.id,
          name: row.category_name,
        })),
      },
    });
  } catch (err) {
    console.error("ERROR GET PUBLIC TICKETS:", err);

    return Response.json(
      {
        success: false,
        message: err.message || "Internal server error",
      },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
