import { Box, Drawer } from "@mui/material";
import SidebarContent, { SIDEBAR_WIDTH } from "./SidebarContent";

const MobileLeftNavBar = ({
  menus,
  activeMenu,
  onMenuClick,
  user,
  drawerOpen,
  onCloseDrawer,
  onShowLoading,
  onHideLoading,
  setLoadingMessage,
}) => {
  return (
    <Box>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={onCloseDrawer}
        PaperProps={{
          sx: {
            width: SIDEBAR_WIDTH,
            bgcolor: "background.default",
            borderRight: 0,
          },
        }}
      >
        <SidebarContent
          menus={menus}
          activeMenu={activeMenu}
          onMenuClick={onMenuClick}
          user={user}
          onShowLoading={onShowLoading}
          onHideLoading={onHideLoading}
          setLoadingMessage={setLoadingMessage}
          onNavigateComplete={onCloseDrawer}
          width={SIDEBAR_WIDTH}
          isDrawer
        />
      </Drawer>
    </Box>
  );
};

export default MobileLeftNavBar;
