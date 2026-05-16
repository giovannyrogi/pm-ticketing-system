export const roleTabs = [
  { label: "Semua", value: "all", icon: "mdi:account-group-outline" },
  { label: "User", value: "user", icon: "mdi:account-outline" },
  { label: "Admin", value: "admin", icon: "mdi:shield-account-outline" },
  {
    label: "Superadmin",
    value: "superadmin",
    icon: "mdi:shield-crown-outline",
  },
  { label: "Aktif", value: "active", icon: "mdi:account-check-outline" },
  { label: "Nonaktif", value: "inactive", icon: "mdi:account-off-outline" },
];

export const roleColor = {
  user: "blue",
  admin: "gold",
  superadmin: "red",
};

export const emptyUserForm = {
  fullName: "",
  username: "",
  email: "",
  phoneNumber: "",
  role: "user",
  isActive: true,
  password: "",
};

export const roleOptions = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "superadmin", label: "Superadmin" },
];

export const getUserFormValues = (mode, user) =>
  mode === "edit" && user
    ? {
        fullName: user.full_name || "",
        username: user.username || "",
        email: user.email || "",
        phoneNumber: user.phone_number || "",
        role: user.role || "user",
        isActive: Boolean(user.is_active),
        password: "",
      }
    : emptyUserForm;
