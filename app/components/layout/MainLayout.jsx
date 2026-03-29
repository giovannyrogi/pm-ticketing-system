"use client";
import { Box, Grid } from "@mui/material";
import TopMenu from "../navbar/TopMenu";
import LeftNavbar from "../navbar/LeftNavBar";

const MainLayout = ({
  children,
  user,
  menus,
  showSidebar = false,
  onBurgerClick,
  drawerOpen,
  onCloseDrawer,
  onShowLoading,
  onHideLoading,
  loadingBackdrop,
}) => {
  return (
    <>
      {loadingBackdrop}
      <Box sx={{ minHeight: "100vh" }}>
        <Grid container>
          {/* TOP MENU */}
          <Grid size={12}>
            <TopMenu
              user={user}
              onBurgerClick={onBurgerClick}
              onShowLoading={onShowLoading}
              onHideLoading={onHideLoading}
              showSidebar={showSidebar}
            />
          </Grid>

          {/* SIDEBAR */}
          {showSidebar && (
            <LeftNavbar
              menus={menus}
              user={user}
              drawerOpen={drawerOpen}
              onCloseDrawer={onCloseDrawer}
              onShowLoading={onShowLoading}
              onHideLoading={onHideLoading}
            />
          )}

          {/* CONTENT */}
          <Grid size={12}>{children}</Grid>
        </Grid>
      </Box>
    </>
  );
};

export default MainLayout;