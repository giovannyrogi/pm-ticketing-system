"use client";
import { Box } from "@mui/material";
import { useUser } from "../utils/useUser";
import MainLayout from "../components/layout/MainLayout";
export default function PublicLayout({ children }) {
  const { user } = useUser();

  return (
    <MainLayout user={user} showSidebar={false}>
      {children}
    </MainLayout>
  );
}
