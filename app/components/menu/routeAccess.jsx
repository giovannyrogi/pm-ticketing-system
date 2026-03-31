export const ROUTE_ACCESS = [
  {
    path: "/",
    roles: ["user", "admin", "superadmin"],
  },
  {
    path: "/ticket-list",
    roles: ["admin", "superadmin"],
  },
  {
    path: "/my-tickets",
    roles: ["user"],
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
    path: "/categories",
    roles: ["superadmin"],
  },
];