"use client";
import { Box, Grid, useMediaQuery } from "@mui/material";
import TopMenu from "../navbar/TopMenu";
import LoadingBackdrop from "../loading/Backdrop";
import { useState } from "react";
import MobileLeftNavBar from "../navbar/MobileLeftNavBar";
import LeftNavBar from "../navbar/LeftNavBar";

const MainLayout = ({
  children,
  user,
  menus,
  showSidebar,
  onBurgerClick,
  drawerOpen,
  onCloseDrawer,
}) => {
  const isMobile = useMediaQuery("(max-width:1300px)");
  const [loadingBackdropOpen, setLoadingBackdropOpen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");

  const isLoggedIn = !!user;

  return (
    <>
      <LoadingBackdrop open={loadingBackdropOpen} message={loadingMessage} />
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          color: "text.primary",
          transition: "all 0.3s",
        }}
      >
        <Grid container rowGap={1}>
          {/* Sidebar hanya muncul di desktop */}
          {!isMobile && isLoggedIn && (
            <Grid
              size={2}
              sx={{
                position: "sticky",
                top: 0,
                height: "100vh",
              }}
            >
              <LeftNavBar
                menus={menus || []}
                user={user}
                onShowLoading={() => setLoadingBackdropOpen(true)}
                onHideLoading={() => setLoadingBackdropOpen(false)}
                setLoadingMessage={setLoadingMessage}
                isLoggedIn={isLoggedIn}
              />
            </Grid>
          )}

          {/* Konten utama */}
          <Grid size={!isMobile && isLoggedIn ? 10 : 12}>
            <Grid
              size={12}
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 9,
                backgroundColor: "background.default",
              }}
            >
              {/* TOP MENU */}
              <Grid size={12}>
                <TopMenu
                  user={user}
                  isLoggedIn={isLoggedIn}
                  onBurgerClick={onBurgerClick}
                  onShowLoading={() => setLoadingBackdropOpen(true)}
                  onHideLoading={() => setLoadingBackdropOpen(false)}
                />
              </Grid>
            </Grid>

            {/* Drawer mobile */}
            {isMobile && isLoggedIn && (
              <MobileLeftNavBar
                menus={menus}
                user={user}
                isLoggedIn={isLoggedIn}
                drawerOpen={drawerOpen || false}
                onCloseDrawer={onCloseDrawer}
                onShowLoading={() => setLoadingBackdropOpen(true)}
                onHideLoading={() => setLoadingBackdropOpen(false)}
                setLoadingMessage={() => setLoadingMessage()}
              />
            )}

            {/* CONTENT */}
            <Grid
              size={12}
              sx={{
                // overflowY: "auto",
                // height: "calc(100vh - 55px)", // tinggi layar dikurangi tinggi TopMenu
                p: 2,
              }}
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
