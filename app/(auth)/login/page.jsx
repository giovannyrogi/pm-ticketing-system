"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  useMediaQuery,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { Icon } from "@iconify/react";
import axios from "axios";
import Image from "next/image";
import Notification from "@/app/components/notification/Notification";
import LoadingBackdrop from "@/app/components/loading/Backdrop";
import Footer from "@/app/components/footer/page";
import { useThemeMode } from "@/app/components/themeprovider/ThemeContext";

export default function LoginPage() {
  const isMobile = useMediaQuery("(max-width:600px)");
  const router = useRouter();
  const { themeMode, setThemeMode } = useThemeMode();
  const theme = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false); // loading saat klik login
  const [redirecting, setRedirecting] = useState(false); // loading saat pindah page
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/login", { username, password });
      setSnackbar({
        open: true,
        message: "Login berhasil!",
        severity: "success",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Login gagal!",
        severity: "error",
      });
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100%",
        bgcolor: "background.default",
        color: "text.primary",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        transition: "all 0.3s",
        padding: isMobile ? 3 : 0,
        // Tambahkan background image sesuai themeMode
        // backgroundImage: `url(${
        //   themeMode === "dark"
        //     ? "/login-bg-darkmode.png"
        //     : "/login-bg-lightmode.png"
        // })`,
        // backgroundSize: "cover",
        // backgroundPosition: "center",
        // backgroundRepeat: "no-repeat",
      }}
    >
      {/* Spinner full screen saat redirect */}
      <LoadingBackdrop
        open={redirecting}
        message="Redirecting..."
        color="#fff"
      />

      <Paper
        elevation={6}
        sx={{
          p: isMobile ? 3 : 5,
          width: "100%",
          maxWidth: 400,
          borderRadius: 3,
          bgcolor: "background.default",
          boxShadow: 4,
        }}
      >
        <Box
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          mb={1}
        >
          <IconButton
            onClick={() => {
              setThemeMode(themeMode === "dark" ? "light" : "dark");
              localStorage.setItem(
                "currentTheme",
                JSON.stringify({
                  currentThemeMode: themeMode === "dark" ? "light" : "dark",
                }),
              );
            }}
            color="primary"
            aria-label="toggle theme"
          >
            {themeMode === "dark" ? (
              <Icon
                icon="line-md:sunny-filled-loop-to-moon-filled-loop-transition"
                fontSize="25px"
              />
            ) : (
              <Icon
                icon="line-md:moon-filled-alt-to-sunny-filled-loop-transition"
                fontSize="25px"
              />
            )}
          </IconButton>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            mb: 2,
          }}
        >
          {/* <Image
            src="/logo-pdpasar.png"
            alt="logo-pdpasar"
            width={100}
            height={100}
          /> */}
          <Image
            src={
              themeMode === "dark"
                ? "/logo-darkmode.png"
                : "/logo-lightmode.png"
            }
            alt="logo-pdpasar"
            width={200}
            height={80}
            // style={{backgroundColor:'orange'}}
          />
          {/* <Typography
            sx={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "primary.main",
            }}
          >
            Parumda Pasar Manado
          </Typography> */}
        </Box>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <TextField
            label="Username"
            variant="filled"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
            disabled={loading || redirecting}
            color="primary"
          />
          <TextField
            label="Password"
            variant="filled"
            fullWidth
            margin="normal"
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading || redirecting}
            color="primary"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPass(!showPass)}
                    edge="end"
                    disabled={loading || redirecting}
                  >
                    {showPass ? (
                      <Icon
                        icon="line-md:watch-twotone-loop"
                        style={{ color: theme.palette.primary.main }}
                        fontSize={25}
                      />
                    ) : (
                      <Icon
                        icon="line-md:watch-off-loop"
                        style={{ color: theme.palette.primary.main }}
                        fontSize={25}
                      />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, fontWeight: "bold", fontSize: 16 }}
            disabled={loading || redirecting}
            startIcon={
              loading && <CircularProgress size={22} color="inherit" />
            }
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Paper>

      {/* Footer  */}
      <Footer />

      {/* Snackbar notification */}
      <Notification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
}
