import { cache } from "react";
import pool from "@/lib/dbConfig";

/**
 * Mengambil data minimum yang dibutuhkan mesin pencari untuk halaman detail
 * laporan publik. Query ini sengaja hanya mengizinkan tiket selesai dan
 * dipublish agar data protected/internal tidak masuk metadata atau sitemap.
 */
export const getPublicTicketSeo = cache(async (ticketId) => {
  if (!ticketId || Number.isNaN(Number(ticketId))) return null;

  const result = await pool.query(
    `
      SELECT
        t.id,
        t.ticket_code,
        t.ticket_title,
        t.ticket_description,
        t.published_at,
        t.updated_at,
        c.category_name,
        l.location_name,
        (
          SELECT att.image_url
          FROM attachments att
          WHERE att.ticket_id = t.id
          AND att.message_id IS NULL
          ORDER BY att.id ASC
          LIMIT 1
        ) AS thumbnail_url
      FROM tickets t
      LEFT JOIN categories c ON c.id = t.category_id
      LEFT JOIN locations l ON l.id = t.location_id
      WHERE t.id = $1
      AND t.is_public = TRUE
      AND t.status = 'selesai'
      LIMIT 1
    `,
    [Number(ticketId)],
  );

  return result.rows[0] || null;
});

/**
 * Mengambil daftar tiket publik untuk sitemap. Data yang diambil hanya kolom
 * yang dibutuhkan crawler, sehingga sitemap tetap ringan dan tidak membocorkan
 * informasi internal seperti pelapor, admin handler, percakapan, atau status
 * protected lain.
 */
export const getPublicTicketSitemapRows = async () => {
  const result = await pool.query(
    `
      SELECT
        id,
        updated_at,
        published_at,
        (
          SELECT att.image_url
          FROM attachments att
          WHERE att.ticket_id = tickets.id
          AND att.message_id IS NULL
          ORDER BY att.id ASC
          LIMIT 1
        ) AS thumbnail_url
      FROM tickets
      WHERE is_public = TRUE
      AND status = 'selesai'
      ORDER BY published_at DESC NULLS LAST, updated_at DESC
    `,
  );

  return result.rows;
};
