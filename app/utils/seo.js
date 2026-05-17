/**
 * Domain utama SEO aplikasi. Nilai ini dipakai untuk canonical URL, sitemap,
 * robots, Open Graph, dan JSON-LD supaya Google hanya mengenali satu domain
 * resmi meskipun aplikasi juga bisa diakses dari IP/VPS/localhost.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://pmcare.pasarmanado.id"
).replace(/\/$/, "");

/**
 * Nama aplikasi yang digunakan konsisten di metadata, title template, dan
 * structured data agar identitas brand tidak tersebar hardcoded di banyak file.
 */
export const SITE_NAME = "PMCare";

/**
 * Deskripsi default untuk halaman publik ketika halaman tidak memiliki
 * ringkasan khusus. Panjangnya dijaga agar aman untuk meta description.
 */
export const DEFAULT_SEO_DESCRIPTION =
  "PMCare adalah layanan pengaduan masyarakat Pasar Manado untuk melihat laporan publik yang sudah selesai ditangani dan dipublikasikan.";

/**
 * Mengubah path internal menjadi URL absolut berbasis domain resmi.
 * Ini penting karena canonical, Open Graph, robots, dan sitemap membutuhkan URL
 * absolut agar crawler tidak menebak domain dari request yang sedang aktif.
 */
export const buildAbsoluteUrl = (path = "/") => {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;

  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

/**
 * Membersihkan teks panjang dari database sebelum dipakai sebagai title atau
 * description SEO. Spasi ganda dirapikan dan panjang teks dibatasi agar snippet
 * di Google tetap terbaca rapi.
 */
export const trimSeoText = (value = "", maxLength = 155) => {
  const normalized = String(value).replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) return normalized;

  return `${normalized.slice(0, maxLength - 3).trim()}...`;
};

/**
 * Builder URL khusus detail laporan publik. Dipusatkan supaya canonical,
 * sitemap, dan JSON-LD selalu memakai pola URL yang sama.
 */
export const publicTicketUrl = (ticketId) =>
  buildAbsoluteUrl(`/public-ticket-details/${ticketId}`);
