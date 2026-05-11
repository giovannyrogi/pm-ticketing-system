import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import "antd/dist/reset.css";
import AppProviders from "./components/appprovider/AppProviders";

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

export const metadata = {
  title: "PMCare - Ticketing System Perumda Pasar Manado",
  description: "PMCare adalah aplikasi inovatif yang dirancang untuk meningkatkan efisiensi dan pelayanan di Perumda Pasar Manado. Dengan fitur-fitur canggih, PMCare membantu mengelola operasional pasar, memantau inventaris, dan memberikan layanan pelanggan yang lebih baik. Aplikasi ini bertujuan untuk mendukung pertumbuhan bisnis dan meningkatkan pengalaman pengunjung di pasar.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}