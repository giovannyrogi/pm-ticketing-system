"use client";
import React, { useState } from "react";
import { Box, Grid, useMediaQuery } from "@mui/material";
import LoadingBackdrop from "../components/loading/Backdrop";
import TopMenu from "../components/navbar/TopMenu";
import { useUser } from "../utils/useUser";
import { getMenusByRole } from "../components/menu/getMenuByRole";
import MENU_CONFIG from "../components/menu/MenuConfig";
import LeftNavbar from "../components/navbar/LeftNavBar";

const MainLayout = ({ children }) => {
  const isMobile = useMediaQuery("(max-width:1300px)");
  const { user } = useUser();
  const menus = getMenusByRole(MENU_CONFIG, user?.role_id);

  // Pusatkan kontrol Drawer di MainLayout
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loadingBackdropOpen, setLoadingBackdropOpen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");

  // aktifkan backdrop
  const handleShowLoading = () => setLoadingBackdropOpen(true);
  const handleHideLoading = () => setLoadingBackdropOpen(false);

  return (
    <>
      {/* === GLOBAL BACKDROP === */}
      <LoadingBackdrop open={loadingBackdropOpen} message={loadingMessage} />
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          color: "text.primary",
          transition: "all 0.3s",
          // p: isMobile ? 2 : 0,
        }}
      >
        <Grid container rowGap={1}>
          {/* Konten utama */}
          <Grid size={12}>
            <Grid
              size={12}
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 9,
                backgroundColor: "background.default",
              }}
            >
              {/* Kirim kontrol Drawer ke TopMenu */}
              <TopMenu
                user={user}
                onBurgerClick={() => setDrawerOpen(true)}
                onShowLoading={handleShowLoading}
                onHideLoading={handleHideLoading}
              />
            </Grid>

            {/* Drawer mobile */}
            <LeftNavbar
              menus={menus}
              user={user}
              drawerOpen={drawerOpen}
              onCloseDrawer={() => setDrawerOpen(false)}
              onShowLoading={handleShowLoading}
              onHideLoading={handleHideLoading}
              setLoadingMessage={(message) => setLoadingMessage(message)}
            />

            <Grid
              size={12}
              // sx={{
              //   overflowY: "auto",
              //   height: "calc(100vh - 55px)", // tinggi layar dikurangi tinggi TopMenu
              //   p: 2,
              // }}
            >
              {children}
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default MainLayout;
