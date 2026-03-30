import { Icon } from "@iconify/react";

const MENU_CONFIG = [
  {
    label: "Beranda",
    value: "home",
    path: "/",
    icon: <Icon icon="svg-spinners:blocks-scale" fontSize="20px" />,
    roles: ["user", "admin", "superadmin"],
  },
  {
    label: "Ticket List",
    value: "ticketList",
    path: "/ticket-list",
    icon: <Icon icon="mdi:discussion-plus-outline" />,
    roles: ["admin", "superadmin"],
    showIcon: true,
  },
  {
    label: "My Tickets",
    value: "myTickets",
    path: "/my-tickets",
    icon: <Icon icon="oui:nav-ticketing" fontSize="20px" />,
    roles: ["user"],
  },
  {
    label: "Data Master",
    value: "dataMaster",
    icon: <Icon icon="mdi:database-outline" fontSize="20px" />,
    roles: ["superadmin", "admin"],
    submenu: [
      {
        label: "Users",
        value: "users",
        path: "/users",
        icon: <Icon icon="mdi:account-group-outline" />,
        roles: ["superadmin"],
        showIcon: true,
      },
      {
        label: "Locations",
        value: "locations",
        path: "/locations",
        icon: <Icon icon="mdi:map-marker-outline" />,
        roles: ["superadmin", "admin"],
        showIcon: true,
      },
      {
        label: "Categories",
        value: "categories",
        path: "/categories",
        icon: <Icon icon="tabler:category" />,
        roles: ["superadmin", "admin"],
        showIcon: true,
      },
    ],
  },
];

export default MENU_CONFIG;
