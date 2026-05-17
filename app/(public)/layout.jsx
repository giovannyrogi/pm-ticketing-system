import PublicLayoutClient from "./PublicLayoutClient";
import {
  DEFAULT_SEO_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/app/utils/seo";

/**
 * Metadata khusus area publik. Segment ini boleh diindeks, berbeda dari area
 * auth/protected, sehingga canonical dan robots dibuat eksplisit untuk halaman
 * publik yang menjadi sumber trafik Google.
 */
export const metadata = {
  title: {
    default: "PMCare - Layanan Pengaduan Masyarakat Pasar Manado",
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_SEO_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PMCare - Layanan Pengaduan Masyarakat Pasar Manado",
    description: DEFAULT_SEO_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "PMCare - Layanan Pengaduan Masyarakat Pasar Manado",
    description: DEFAULT_SEO_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Wrapper layout publik tetap memakai client layout yang sudah ada agar UI dan
 * flow tidak berubah, sementara metadata SEO dikelola di server file ini.
 */
export default function PublicLayout({ children }) {
  return <PublicLayoutClient>{children}</PublicLayoutClient>;
}
