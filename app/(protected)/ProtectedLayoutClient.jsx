"use client";
import { useState } from "react";
import { useUser } from "../utils/useUser";
import { getMenusByRole } from "../components/menu/getMenuByRole";
import MENU_CONFIG from "../components/menu/MenuConfig";
import MainLayout from "../components/layout/MainLayout";

export default function ProtectedLayout({ children }) {
  const { user } = useUser();
  const menus = getMenusByRole(MENU_CONFIG, user?.role);

  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <MainLayout
      user={user}
      menus={menus}
      showSidebar={true}
      drawerOpen={drawerOpen}
      onBurgerClick={() => setDrawerOpen(true)}
      onCloseDrawer={() => setDrawerOpen(false)}
    >
      {children}
    </MainLayout>
  );
}
