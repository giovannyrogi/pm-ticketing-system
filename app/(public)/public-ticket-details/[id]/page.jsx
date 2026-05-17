import PublicTicketDetailClient from "./PublicTicketDetailClient";
import { getPublicTicketSeo } from "@/app/utils/publicTicketSeo";
import {
  buildAbsoluteUrl,
  DEFAULT_SEO_DESCRIPTION,
  publicTicketUrl,
  SITE_NAME,
  trimSeoText,
} from "@/app/utils/seo";

/**
 * Metadata dinamis untuk detail laporan publik. Data diambil langsung dari
 * database agar title, description, canonical, Open Graph, dan Twitter card
 * sesuai isi laporan yang dipublish. Jika laporan tidak public/selesai, route
 * diberi noindex supaya tidak masuk indeks Google.
 */
export async function generateMetadata({ params }) {
  const { id } = await params;
  const ticket = await getPublicTicketSeo(id);

  if (!ticket) {
    return {
      title: "Laporan publik tidak ditemukan",
      description: "Laporan publik PMCare tidak ditemukan atau belum dipublish.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = trimSeoText(ticket.ticket_title, 58);
  const description = trimSeoText(
    ticket.ticket_description || DEFAULT_SEO_DESCRIPTION,
  );
  const url = publicTicketUrl(ticket.id);
  const image = ticket.thumbnail_url
    ? buildAbsoluteUrl(ticket.thumbnail_url)
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "id_ID",
      type: "article",
      publishedTime: ticket.published_at?.toISOString?.(),
      modifiedTime: ticket.updated_at?.toISOString?.(),
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Server wrapper untuk menyisipkan JSON-LD Article pada laporan publik tanpa
 * mengubah UI client yang sudah berjalan. JSON-LD membantu Google memahami
 * konteks laporan, kategori, lokasi, dan tanggal publikasi.
 */
export default async function PublicTicketDetailPage({ params }) {
  const { id } = await params;
  const ticket = await getPublicTicketSeo(id);

  const reportSchema = ticket
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: ticket.ticket_title,
        description: trimSeoText(
          ticket.ticket_description || DEFAULT_SEO_DESCRIPTION,
        ),
        datePublished: ticket.published_at?.toISOString?.(),
        dateModified: ticket.updated_at?.toISOString?.(),
        mainEntityOfPage: publicTicketUrl(ticket.id),
        publisher: {
          "@type": "Organization",
          name: "Perumda Pasar Manado",
        },
        about: [
          ticket.category_name,
          ticket.location_name,
          "Pengaduan masyarakat Pasar Manado",
        ].filter(Boolean),
      }
    : null;

  return (
    <>
      {reportSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reportSchema) }}
        />
      )}
      <PublicTicketDetailClient />
    </>
  );
}
