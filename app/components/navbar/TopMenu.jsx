import React, { useState } from "react";
import {
  Box,
  IconButton,
  Typography,
  Avatar,
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
import BusinessIcon from "@mui/icons-material/Business";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const TopMenu = ({
  user,
  onBurgerClick,
  onShowLoading,
  onHideLoading,
  showSidebar,
}) => {
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

  const HandleDatabase = () => {
    onShowLoading?.();
    setTimeout(() => {
      router.push("/database");
    }, 1000);
    onHideLoading?.();
  };

  return (
    <Paper
      sx={{
        p: 2,
        height: "55px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "all 0.3s",
        borderRadius: "0px",
        // marginBottom: "20px",
        // background: themeMode === "dark" ? "#1C1C1C" : "#fff",
        // backgroundColor:'orange'
      }}
    >
      {/* Left: Burger Icon */}

      {user ? (
        <>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              onClick={onBurgerClick}
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
              }}
            >
              <MenuIcon />
              <Typography sx={{ fontFamily: "poppins", fontWeight: "bold" }}>
                Menu
              </Typography>
            </Button>
          </Box>

          {/* Right: Theme Toggle + Avatar */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Tooltip title="Notifikasi">
              <IconButton
                // onClick={handleAvatarClick}
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
                  icon="line-md:bell-filled-loop"
                  color={theme.palette.primary.main}
                  fontSize="25px"
                />
              </IconButton>
            </Tooltip>
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
              PaperProps={{
                elevation: 3,
                sx: { mt: 1.5, minWidth: 180 },
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
              <MenuItem onClick={handleProfile}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Profil
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
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
          }}
        >
          <Box>
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
              variant="contained"
              size="small"
              sx={{
                textTransform: "capitalize",
                fontWeight: "bold",
                fontFamily: "poppins",
              }}
            >
              <Link
                href="/login"
                style={{ textDecoration: "none", color: "#fff" }}
                target="_blank"
              >
                Login
              </Link>
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default TopMenu;
