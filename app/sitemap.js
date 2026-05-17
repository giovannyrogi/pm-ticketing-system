import { getPublicTicketSitemapRows } from "./utils/publicTicketSeo";
import { buildAbsoluteUrl, publicTicketUrl } from "./utils/seo";

// Sitemap direvalidasi berkala agar tiket publik baru terbaca crawler tanpa
// perlu generate ulang setiap request.
export const revalidate = 3600;

/**
 * Sitemap dinamis untuk halaman publik PMCare. Hanya homepage dan tiket yang
 * sudah selesai serta dipublish yang dimasukkan, sehingga Google fokus
 * mengindeks konten publik yang aman dan relevan.
 */
export default async function sitemap() {
  const publicTickets = await getPublicTicketSitemapRows();

  return [
    {
      url: buildAbsoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...publicTickets.map((ticket) => ({
      url: publicTicketUrl(ticket.id),
      lastModified: ticket.updated_at || ticket.published_at || new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
      images: ticket.thumbnail_url
        ? [buildAbsoluteUrl(ticket.thumbnail_url)]
        : undefined,
    })),
  ];
}
