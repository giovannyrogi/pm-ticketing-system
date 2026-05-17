import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import "antd/dist/reset.css";
import AppProviders from "./components/appprovider/AppProviders";
import {
  DEFAULT_SEO_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "./utils/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
});

/**
 * Metadata global diwariskan ke semua route. Nilai ini menjadi fallback utama
 * untuk title, description, Open Graph, Twitter card, dan canonical resolver
 * melalui metadataBase.
 */
export const metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: "PMCare - Layanan Pengaduan Masyarakat Pasar Manado",
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_SEO_DESCRIPTION,
  keywords: [
    "PMCare",
    "Pasar Manado",
    "Perumda Pasar Manado",
    "pengaduan masyarakat",
    "laporan pasar",
    "layanan publik",
  ],
  authors: [{ name: "Perumda Pasar Manado" }],
  creator: "Perumda Pasar Manado",
  publisher: "Perumda Pasar Manado",
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
};

export default function RootLayout({ children }) {
  /**
   * Structured data global membantu crawler memahami bahwa PMCare adalah
   * aplikasi layanan publik milik Perumda Pasar Manado, bukan sekadar halaman
   * web biasa. Data dibuat global karena berlaku untuk seluruh aplikasi.
   */
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "GovernmentOrganization",
      name: "Perumda Pasar Manado",
      url: SITE_URL,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: SITE_NAME,
      url: SITE_URL,
      description: DEFAULT_SEO_DESCRIPTION,
      applicationCategory: "PublicServiceApplication",
      operatingSystem: "Web",
    },
  ];

  return (
    <html lang="id">
      <body className={poppins.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
