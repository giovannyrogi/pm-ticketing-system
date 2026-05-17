/**
 * Halaman login, register, dan lupa password tidak bernilai untuk SEO publik
 * serta tidak perlu muncul di Google. noindex juga mengurangi risiko crawler
 * mengarahkan user ke halaman akses akun sebagai hasil pencarian utama.
 */
export const metadata = {
  title: "PMCare - Akses Akun",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

/**
 * Layout auth sengaja minimal karena halaman auth sudah punya desain sendiri.
 * File ini hanya bertugas memberi metadata noindex ke seluruh route auth.
 */
export default function AuthLayout({ children }) {
  return children;
}
