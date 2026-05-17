import { buildAbsoluteUrl } from "./utils/seo";

/**
 * robots.txt terprogram untuk mengarahkan crawler hanya ke halaman yang layak
 * diindeks. Route auth, dashboard, data master, ticket internal, dan API
 * diblokir agar data akun atau workflow internal tidak muncul di hasil Google.
 */
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/public-ticket-details/"],
      disallow: [
        "/login",
        "/register",
        "/forgot-password",
        "/dashboard",
        "/ticket-list",
        "/my-tickets",
        "/ticket-details",
        "/account",
        "/users",
        "/locations",
        "/category",
        "/api/",
      ],
    },
    sitemap: buildAbsoluteUrl("/sitemap.xml"),
  };
}
