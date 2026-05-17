"use client";

import React, { useState } from "react";
import {
  Box,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Tooltip,
  useTheme,
  alpha,
  Paper,
  useMediaQuery,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import NotificationBell from "@/app/components/notifications/NotificationBell";
import FontStyle from "../font-style/FontStyle";

const TopMenu = ({ user, onBurgerClick, onShowLoading, onHideLoading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:1300px)");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const router = useRouter();

  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    onShowLoading?.();
    try {
      await axios.post("/api/logout");
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (err) {
      console.log("error logout", err);
      onHideLoading?.();
    }
  };

  const handleProfile = () => {
    onShowLoading?.();
    setTimeout(() => {
      router.push("/account");
      onHideLoading?.();
    }, 1000);
  };

  return (
    <Paper
      sx={{
        px: { xs: 1.8, sm: 2 },
        py: 1,
        height: "56px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
        zIndex: 10,
        overflow: "hidden",
        transition: "all 0.3s ease",
        borderRadius: "0px",
        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(255,245,245,0.94) 42%, rgba(255,241,242,0.92) 100%)",
        boxShadow:
          "0 10px 30px rgba(15,23,42,0.06), inset 0 -1px 0 rgba(255,255,255,0.72)",
        backdropFilter: "blur(14px)",
        "&:before": {
          content: '""',
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 8% 0%, rgba(230,9,9,0.08), transparent 28%), radial-gradient(circle at 96% 30%, rgba(230,9,9,0.075), transparent 26%)",
        },
      }}
    >
      {/* Left: Burger Icon */}

      {!!user ? (
        <>
          {/* LEFT */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isMobile && (
              <Button
                onClick={() => onBurgerClick?.()}
                edge="start"
                aria-label="open drawer"
                sx={{
                  m: 0,
                  p: 0,
                  color: theme.palette.primary.main,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  textTransform: "capitalize",
                  borderRadius: 2,
                  px: 1,
                  py: 0.7,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <MenuIcon />
                <Typography sx={{ fontFamily: "poppins", fontWeight: "bold" }}>
                  Menu
                </Typography>
              </Button>
            )}
          </Box>

          {/* Right: Theme Toggle + Avatar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.2, sm: 2 },
              position: "relative",
              zIndex: 1,
            }}
          >
            <NotificationBell
              user={user}
              onShowLoading={onShowLoading}
              onHideLoading={onHideLoading}
            />
            <Tooltip title="Settings">
              <IconButton
                onClick={handleAvatarClick}
                size="small"
                sx={{
                  color: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                <Icon
                  icon="line-md:cog-loop"
                  color={theme.palette.primary.main}
                  fontSize="25px"
                />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              disableScrollLock
              PaperProps={{
                elevation: 3,
                sx: {
                  mt: 1.45,
                  minWidth: 210,
                  overflow: "hidden",
                  borderRadius: 2.6,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,245,245,0.96) 52%, rgba(240,253,244,0.94) 100%)",
                  boxShadow:
                    "0 20px 48px rgba(15,23,42,0.16), 0 8px 20px rgba(230,9,9,0.08)",
                  p: 0.75,
                  "& .MuiMenu-list": {
                    p: 0,
                  },
                },
              }}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem
                onClick={handleProfile}
                sx={{
                  gap: 1.2,
                  borderRadius: 1.8,
                  px: 1.4,
                  py: 1.15,
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 600,
                  color: "rgba(15,23,42,0.82)",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: "0 !important",
                    width: 30,
                    height: 30,
                    borderRadius: 1.6,
                    display: "grid",
                    placeItems: "center",
                    color: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  }}
                >
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <FontStyle fontSize={14} fontWeight="600">
                  Profil
                </FontStyle>
              </MenuItem>
              <Divider sx={{ my: 0.65, borderColor: alpha("#0f172a", 0.08) }} />
              <MenuItem
                onClick={handleLogout}
                sx={{
                  gap: 1.2,
                  borderRadius: 1.8,
                  px: 1.4,
                  py: 1.15,
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 600,
                  color: "rgba(15,23,42,0.82)",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: "0 !important",
                    width: 30,
                    height: 30,
                    borderRadius: 1.6,
                    display: "grid",
                    placeItems: "center",
                    color: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  }}
                >
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <FontStyle fontSize={14} fontWeight="600">
                  Logout
                </FontStyle>
              </MenuItem>
            </Menu>
          </Box>
        </>
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
            width: "100%",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box
            onClick={() => {
              onShowLoading?.();
              setTimeout(() => {
                router.push("/");
                onHideLoading?.();
              }, 1000);
            }}
            sx={{
              cursor: "pointer",
            }}
          >
            <Image
              src={"/logo-pm-ticketing1.png"}
              alt="logo-pdpasar"
              width={70}
              height={40}
              // style=1{backgroundColor:'orange'}}
            />
          </Box>
          <Box>
            <Button
              onClick={() => {
                onShowLoading?.();
                setTimeout(() => {
                  router.push("/login");
                }, 1000);
              }}
              variant="contained"
              size="small"
              startIcon={
                <Icon icon="solar:document-add-bold-duotone" width={20} />
              }
              sx={{
                textTransform: "capitalize",
                fontWeight: 600,
                fontFamily: "Poppins, sans-serif",
                borderRadius: 1.6,
                px: { xs: 1.4, sm: 1.7 },
                py: 0.75,
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
                bgcolor: theme.palette.primary.main,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
                boxShadow:
                  "0 10px 22px rgba(230,9,9,0.22), inset 0 1px 0 rgba(255,255,255,0.22)",
                "& .MuiButton-startIcon": {
                  mr: 0.7,
                  ml: 0,
                  display: "inline-flex",
                  alignItems: "center",
                },
                "& .MuiButton-startIcon svg": {
                  display: "block",
                },
                "&:hover": {
                  bgcolor: theme.palette.primary.dark,
                  boxShadow:
                    "0 12px 26px rgba(230,9,9,0.28), inset 0 1px 0 rgba(255,255,255,0.24)",
                  transform: "translateY(-1px)",
                },
                transition: "all 180ms ease",
                textAlign: "center",
              }}
            >
              Buat Laporan
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default TopMenu;
