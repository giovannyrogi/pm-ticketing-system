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
    label: "Daftar Tiket",
    value: "ticketList",
    path: "/ticket-list",
    icon: <Icon icon="mdi:discussion-plus-outline" />,
    roles: ["admin", "superadmin"],
    showIcon: true,
  },
  {
    label: "Tiket Saya",
    value: "myTickets",
    path: "/my-tickets",
    icon: <Icon icon="oui:nav-ticketing" fontSize="20px" />,
    roles: ["user"],
  },
  {
    label: "Data Master",
    value: "dataMaster",
    icon: <Icon icon="mdi:database-outline" fontSize="20px" />,
    roles: ["superadmin"],
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
        label: "Lokasi",
        value: "locations",
        path: "/locations",
        icon: <Icon icon="mdi:map-marker-outline" />,
        roles: ["superadmin"],
        showIcon: true,
      },
      {
        label: "Kategori",
        value: "category",
        path: "/category",
        icon: <Icon icon="tabler:category" />,
        roles: ["superadmin"],
        showIcon: true,
      },
    ],
  },
];

export default MENU_CONFIG;
