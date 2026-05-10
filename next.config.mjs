/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export", // WAJIB untuk dapat folder export
  // images: {
  //   unoptimized: true, // WAJIB untuk static export
  // },
  // Aktifkan pemeriksaan React agar bug mudah ditemukan
  reactStrictMode: true,

  // Hapus header X-Powered-By (mencegah fingerprint)
  poweredByHeader: false,

  // Hardening keamanan bawaan Next.js
  compress: true, // gzip compress
  cleanDistDir: true, // hapus folder .next lama saat build

  // Standar untuk runtime modern
  // output: "standalone", // terbaik untuk deployment VPS

  // allowedDevOrigins: ["http://localhost:3000", "http://localhost:3001"],

  webpack: (config) => {
    // pastikan Iconify resolve ke versi yang benar
    config.resolve.alias["@iconify/react"] = require.resolve("@iconify/react");
    return config;
  },
};

module.exports = nextConfig;
