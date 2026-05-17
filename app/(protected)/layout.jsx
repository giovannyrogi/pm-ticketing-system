import ProtectedLayoutClient from "./ProtectedLayoutClient";

/**
 * Semua halaman protected adalah area kerja internal, jadi diberi noindex agar
 * dashboard, daftar tiket admin, akun, dan data master tidak masuk hasil mesin
 * pencari.
 */
export const metadata = {
  title: "PMCare - Area Internal",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

/**
 * Wrapper server tipis untuk metadata. Komponen layout interaktif tetap
 * dipisah di ProtectedLayoutClient agar hook client tidak bercampur dengan
 * metadata server.
 */
export default function ProtectedLayout({ children }) {
  return <ProtectedLayoutClient>{children}</ProtectedLayoutClient>;
}
