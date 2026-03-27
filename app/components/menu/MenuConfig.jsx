import PeopleIcon from "@mui/icons-material/People";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { Icon } from "@iconify/react";
import { ROLES } from "./ConstantRoles";

const MENU_CONFIG = [
  {
    label: "Dashboard",
    value: "dashboard",
    path: "/dashboard",
    icon: <Icon icon="svg-spinners:blocks-scale" fontSize="20px" />,
    roles: Object.values(ROLES),
  },
  {
    label: "Data Master",
    value: "dataMaster",
    icon: <Icon icon="material-symbols:database" fontSize="20px" />,
    roles: [
      ROLES.SUPERADMIN,
      ROLES.DIVISI_KONTRAK,
    ],
    submenu: [
      {
        label: "Roles",
        value: "roles",
        path: "/roles",
        icon: <Icon icon="oui:app-users-roles" fontSize="20px" />,
        roles: [ROLES.SUPERADMIN],
        showIcon: true,
      },
      {
        label: "Users",
        value: "users",
        path: "/users",
        icon: <Icon icon="hugeicons:location-user-03" fontSize="20px" />,
        roles: [ROLES.SUPERADMIN],
        showIcon: true,
      },
      {
        label: "Locations",
        value: "locations",
        path: "/locations",
        icon: <Icon icon="mdi:location-radius-outline" fontSize="20px" />,
        roles: [
          ROLES.SUPERADMIN,
          ROLES.DIVISI_KONTRAK,
        ],
        showIcon: true,
      },
      {
        label: "Floor",
        value: "floor",
        path: "/floor",
        icon: <Icon icon="ion:pricetags-outline" fontSize="20px" />,
        roles: [
          ROLES.SUPERADMIN,
          ROLES.DIVISI_KONTRAK,
        ],
        showIcon: true,
      },
      {
        label: "Rooms",
        value: "rooms",
        path: "/rooms",
        icon: <Icon icon="cil:room" fontSize="20px" />,
        roles: [
          ROLES.SUPERADMIN,
          ROLES.DIVISI_KONTRAK,
        ],
        showIcon: true,
      },
      {
        label: "Identity Lists",
        value: "identity-lists",
        path: "/identity-lists",
        icon: <Icon icon="qlementine-icons:id-card-16" fontSize="20px" />,
        roles: [
          ROLES.SUPERADMIN,
          ROLES.DIVISI_KONTRAK,
        ],
        showIcon: true,
      },
    ],
  },
  {
    label: "Settings",
    value: "settings",
    icon: <Icon icon="line-md:cog-loop" fontSize={23} />,
    roles: Object.values(ROLES),
    hidden: true,
    submenu: [
      {
        label: "Account",
        value: "account",
        path: "/account",
        icon: <Icon icon="mdi:account-edit" fontSize="20px" />,
        roles: Object.values(ROLES),
        hidden: true,
      },
    ],
  },
  // Tambahkan menu lain jika perlu
];

export default MENU_CONFIG;
