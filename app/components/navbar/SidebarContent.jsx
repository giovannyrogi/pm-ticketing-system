import FontStyle from "@/app/components/font-style/FontStyle";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Icon } from "@iconify/react";
import {
  Avatar,
  Box,
  Chip,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const SIDEBAR_WIDTH = 280;

const SidebarContent = ({
  menus = [],
  activeMenu,
  onMenuClick,
  user,
  onShowLoading,
  onHideLoading,
  setLoadingMessage,
  onNavigateComplete,
  width = "100%",
  isDrawer = false,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState(null);

  const visibleMenus = useMemo(
    () => (menus || []).filter((menu) => !menu.hidden),
    [menus],
  );
  const userInitial = user?.full_name?.charAt(0)?.toUpperCase() || "U";

  const activeDropdownValue = useMemo(
    () =>
      visibleMenus.find((menu) =>
        menu.submenu?.some((sub) => sub.path === pathname),
      )?.value || null,
    [pathname, visibleMenus],
  );

  useEffect(() => {
    setOpenDropdown(activeDropdownValue);
  }, [activeDropdownValue]);

  const isMenuActive = (menu) =>
    (menu.path && pathname === menu.path) ||
    (menu.submenu && menu.submenu.some((sub) => sub.path === pathname));

  const isSubMenuActive = (sub) => sub.path === pathname;

  const finishNavigation = useCallback(
    (menu) => {
      onHideLoading?.();
      onNavigateComplete?.();
      onMenuClick?.(menu.value);
    },
    [onHideLoading, onMenuClick, onNavigateComplete],
  );

  const handleMenuClick = useCallback(
    async (menu) => {
      try {
        if (!menu.path && menu.submenu) {
          setOpenDropdown((current) =>
            current === menu.value ? null : menu.value,
          );
          return;
        }

        if (!menu.path) {
          return;
        }

        setLoadingMessage?.("Navigating...");
        onShowLoading?.();
        router.push(menu.path);

        const checkRouteChange = setInterval(() => {
          if (window.location.pathname === menu.path) {
            clearInterval(checkRouteChange);
            finishNavigation(menu);
          }
        }, 100);
      } catch (err) {
        console.error("Navigation error:", err);
        onHideLoading?.();
      }
    },
    [finishNavigation, onHideLoading, onShowLoading, router, setLoadingMessage],
  );

  const getItemStyles = (active, nested = false) => ({
    minHeight: nested ? 42 : 48,
    px: nested ? 1.3 : 1.5,
    py: 1,
    ml: 0,
    borderRadius: 2,
    color: active ? theme.palette.primary.main : "rgba(17, 24, 39, 0.78)",
    bgcolor: active ? alpha(theme.palette.primary.main, 0.1) : "transparent",
    border: active
      ? `1px solid ${alpha(theme.palette.primary.main, 0.18)}`
      : "1px solid transparent",
    boxShadow: active ? "0 8px 18px rgba(230, 9, 9, 0.08)" : "none",
    "&:hover": {
      bgcolor: active
        ? alpha(theme.palette.primary.main, 0.12)
        : alpha(theme.palette.primary.main, 0.06),
      color: theme.palette.primary.main,
      "& .MuiListItemIcon-root": {
        color: theme.palette.primary.main,
        bgcolor: alpha(theme.palette.primary.main, 0.1),
      },
    },
    "&.Mui-selected, &.Mui-selected:hover": {
      bgcolor: alpha(theme.palette.primary.main, 0.1),
      color: theme.palette.primary.main,
    },
    "& .MuiListItemIcon-root": {
      color: active ? theme.palette.primary.main : "rgba(17, 24, 39, 0.72)",
      bgcolor: active ? alpha(theme.palette.primary.main, 0.12) : "#F5F7FB",
    },
  });

  const renderMenuIcon = (icon) => (
    <ListItemIcon
      sx={{
        width: 34,
        height: 34,
        minWidth: 34,
        mr: 1.1,
        borderRadius: 1.8,
        display: "grid",
        placeItems: "center",
        transition: "all 0.2s ease",
      }}
    >
      {icon}
    </ListItemIcon>
  );

  const renderMenuItem = (menu) => {
    const active = isMenuActive(menu) || activeMenu === menu.value;

    if (menu.submenu) {
      const expanded = openDropdown === menu.value;

      return (
        <Box key={menu.value}>
          <ListItem disablePadding sx={{ mb: 0.7 }}>
            <ListItemButton
              selected={active}
              onClick={() => handleMenuClick(menu)}
              sx={getItemStyles(active)}
            >
              {renderMenuIcon(menu.icon)}
              <ListItemText
                primary={
                  <FontStyle
                    sx={{
                      fontSize: 13.5,
                      fontWeight: active ? 600 : 500,
                      letterSpacing: 0,
                    }}
                  >
                    {menu.label}
                  </FontStyle>
                }
              />
              {expanded ? (
                <ExpandLess sx={{ fontSize: 18 }} />
              ) : (
                <ExpandMore sx={{ fontSize: 18 }} />
              )}
            </ListItemButton>
          </ListItem>

          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <List
              disablePadding
              sx={{
                ml: 2.2,
                pl: 1.2,
                mb: 0.8,
                borderLeft: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
              }}
            >
              {menu.submenu.map((sub) => {
                const subActive = isSubMenuActive(sub);

                return (
                  <ListItem disablePadding key={sub.value} sx={{ mb: 0.6 }}>
                    <ListItemButton
                      selected={subActive}
                      onClick={() => handleMenuClick(sub)}
                      sx={getItemStyles(subActive, true)}
                    >
                      {sub.showIcon ? renderMenuIcon(sub.icon) : null}
                      <ListItemText
                        primary={
                          <FontStyle
                            sx={{
                              fontSize: 13,
                              fontWeight: subActive ? 600 : 500,
                              letterSpacing: 0,
                            }}
                          >
                            {sub.label}
                          </FontStyle>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
        </Box>
      );
    }

    return (
      <ListItem disablePadding key={menu.value} sx={{ mb: 0.7 }}>
        <ListItemButton
          selected={active}
          onClick={() => handleMenuClick(menu)}
          sx={getItemStyles(active)}
        >
          {renderMenuIcon(menu.icon)}
          <ListItemText
            primary={
              <FontStyle
                sx={{
                  fontSize: 13.5,
                  fontWeight: active ? 600 : 500,
                  letterSpacing: 0,
                }}
              >
                {menu.label}
              </FontStyle>
            }
          />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Paper
      elevation={isDrawer ? 0 : 6}
      sx={{
        width,
        minWidth: isDrawer ? SIDEBAR_WIDTH : "auto",
        height: "100%",
        minHeight: "100vh",
        borderRadius: 0,
        borderRight: isDrawer ? "none" : "1px solid rgba(15, 23, 42, 0.10)",
        bgcolor: "background.default",
        background:
          "linear-gradient(180deg, #FFFFFF 0%, #FFF7F7 42%, #FFFFFF 100%)",
        boxShadow: isDrawer ? "none" : "8px 0 24px rgba(15, 23, 42, 0.08)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          flex: "1 1 auto",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          px: 1.7,
          py: 1.6,
        }}
      >
        <Stack spacing={1.6}>
          <Box
            sx={{
              px: 1,
              py: 0.8,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Image
              src="/logo-pm-ticketing1.png"
              alt="logo-pm-ticketing"
              width={76}
              height={44}
              priority
              loading="eager"
            />
            <Chip
              label="v1.0.0"
              size="small"
              sx={{
                height: 24,
                borderRadius: 2,
                color: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
                fontFamily: "Poppins, sans-serif",
                fontSize: 10,
                fontWeight: 700,
              }}
            />
          </Box>

          <Box
            sx={{
              p: 1.25,
              borderRadius: 2.5,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
              bgcolor: alpha(theme.palette.primary.main, 0.09),
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              boxShadow: "0 8px 18px rgba(230, 9, 9, 0.07)",
            }}
          >
            <Avatar
              sx={{
                width: 42,
                height: 42,
                bgcolor: theme.palette.primary.main,
                color: "#fff",
                fontFamily: "Poppins, sans-serif",
                fontSize: 18,
                fontWeight: 800,
                border: "2px solid rgba(255,255,255,0.88)",
              }}
            >
              {userInitial}
            </Avatar>
            <Box minWidth={0}>
              <FontStyle
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgba(17, 24, 39, 0.88)",
                  textTransform: "capitalize",
                  letterSpacing: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 165,
                }}
              >
                {user?.full_name || "-"}
              </FontStyle>
              <FontStyle
                sx={{
                  mt: 0.1,
                  fontSize: 12,
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  textTransform: "capitalize",
                  letterSpacing: 0,
                }}
              >
                {user?.role || "-"}
              </FontStyle>
            </Box>
          </Box>
        </Stack>

        <Divider sx={{ my: 2, borderColor: "rgba(15, 23, 42, 0.10)" }} />

        <Box sx={{ px: 0.4, mb: 1 }}>
          <FontStyle
            sx={{
              fontSize: 10.5,
              fontWeight: 800,
              color: "rgba(17,24,39,0.42)",
              textTransform: "uppercase",
              letterSpacing: 0.7,
            }}
          >
            Navigasi
          </FontStyle>
        </Box>

        <List disablePadding>{visibleMenus.map(renderMenuItem)}</List>
      </Box>
    </Paper>
  );
};

export { SIDEBAR_WIDTH };
export default SidebarContent;
