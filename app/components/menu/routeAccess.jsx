export const ROUTE_ACCESS = [
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
