// Route publik boleh dibuka tanpa login. Tambahkan prefix baru di sini jika nanti ada halaman public baru.
export const PUBLIC_ROUTE_PREFIXES = ["/", "/public-ticket-details"];

// Route tujuan default setelah login atau saat user masuk ke halaman yang tidak sesuai role.
export const DEFAULT_ROUTE_BY_ROLE = {
  user: "/",
  admin: "/dashboard",
  superadmin: "/dashboard",
};

export const ROUTE_ACCESS = [
  {
    path: "/dashboard",
    roles: ["admin", "superadmin"],
  },
  {
    path: "/ticket-list",
    roles: ["admin", "superadmin"],
  },
  {
    path: "/ticket-details",
    roles: ["admin", "superadmin", "user"],
  },
  {
    path: "/my-tickets",
    roles: ["user"],
  },
  {
    path: "/account",
    roles: ["admin", "superadmin", "user"],
  },
  {
    path: "/users",
    roles: ["superadmin"],
  },
  {
    path: "/locations",
    roles: ["superadmin"],
  },
  {
    path: "/category",
    roles: ["superadmin"],
  },
];
