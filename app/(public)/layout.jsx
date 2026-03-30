"use client";
import { useState } from "react";
import { useUser } from "../utils/useUser";
import MainLayout from "../components/layout/MainLayout";
import { getMenusByRole } from "../components/menu/getMenuByRole";
import MENU_CONFIG from "../components/menu/MenuConfig";

export default function PublicLayout({ children }) {
  const { user } = useUser();
  const menus = getMenusByRole(MENU_CONFIG, user?.role);

  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <MainLayout
      menus={menus}
      user={user}
      showSidebar={!!user}
      drawerOpen={drawerOpen}
      onBurgerClick={() => setDrawerOpen(true)}
      onCloseDrawer={() => setDrawerOpen(false)}
    >
      {children}
    </MainLayout>
  );
}
