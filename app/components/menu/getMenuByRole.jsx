export const getMenusByRole = (menus, role) => {
  if (!role) return [];

  return menus
    .map((menu) => {
      const hasAccess = menu.roles?.includes(role);

      const filteredSubmenu = menu.submenu
        ? menu.submenu.filter((sub) => sub.roles.includes(role))
        : [];

      if (menu.submenu) {
        if (filteredSubmenu.length === 0) return null;

        return {
          ...menu,
          submenu: filteredSubmenu,
        };
      }

      if (!hasAccess) return null;

      return menu;
    })
    .filter(Boolean);
};