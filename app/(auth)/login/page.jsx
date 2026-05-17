"use client";

import FontStyle from "@/app/components/font-style/FontStyle";
import Footer from "@/app/components/footer/page";
import LoadingBackdrop from "@/app/components/loading/Backdrop";
import Notification from "@/app/components/notification/Notification";
import { Icon } from "@iconify/react";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const loginHighlights = [
  {
    icon: "mdi:ticket-confirmation-outline",
    title: "Pantau laporan",
    description: "Akses tiket layanan sesuai peran akun.",
  },
  {
    icon: "mdi:shield-check-outline",
    title: "Akun terlindungi",
    description: "Masuk dengan kredensial PMCare yang terdaftar.",
  },
];

const LoginPage = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const router = useRouter();
  const theme = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const disabled = loading || redirecting;

  const handleLogin = async () => {
    setLoading(true);
    setRedirecting(true);
    try {
      const response = await axios.post("/api/login", { username, password });

      if (response?.data?.success) {
        setSnackbar({
          open: true,
          message: "Login berhasil!",
          severity: "success",
        });

        setTimeout(() => {
          router.push(response?.data?.redirectTo || "/");
          // setLoading(false);
          // setRedirecting(false);
        }, 1000);
      } else {
        setSnackbar({
          open: true,
          message: response?.data?.message || "Login gagal!",
          severity: "error",
        });
        setLoading(false);
        setRedirecting(false);
      }
    } catch (err) {
      console.log("error login", err);

      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Login gagal!",
        severity: "error",
      });
      setLoading(false);
      setRedirecting(false);
    }
  };

  const handleRedirect = () => {
    setRedirecting(true);
    setTimeout(() => {
      router.push("/register");
    }, 1000);
  };

  const handleRedirectBeranda = () => {
    setRedirecting(true);
    setTimeout(() => {
      router.push("/");
    }, 1000);
  };

  const handleForgotPassword = () => {
    setRedirecting(true);
    setTimeout(() => {
      router.push("/forgot-password");
    }, 800);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        background:
          "linear-gradient(135deg, rgba(230,9,9,0.05) 0%, #FFFFFF 44%, rgba(22,163,74,0.06) 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        px: { xs: 1.6, md: 2.4 },
        transition: "all 0.3s",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          pt: { xs: 3, md: 5 },
          pb: { xs: 5, md: 5 },
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: "100%",
            maxWidth: 940,
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid rgba(15, 23, 42, 0.10)",
            boxShadow: "0 22px 58px rgba(15, 23, 42, 0.12)",
            bgcolor: "background.default",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.02fr 0.98fr" },
          }}
        >
          <Box
            sx={{
              p: { xs: 2.4, md: 3.4 },
              minHeight: { xs: "auto", md: 560 },
              background:
                "linear-gradient(135deg, rgba(230,9,9,0.10) 0%, rgba(255,255,255,1) 54%, rgba(22,163,74,0.09) 100%)",
              borderRight: {
                xs: "none",
                md: "1px solid rgba(15,23,42,0.08)",
              },
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 3,
            }}
          >
            <Stack spacing={2.2}>
              <Chip
                label="PMCare Access"
                size="small"
                sx={{
                  width: "fit-content",
                  height: 26,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.09),
                  color: theme.palette.primary.main,
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 600,
                  fontSize: 11,
                }}
              />

              <Box>
                <FontStyle
                  sx={{
                    fontSize: { xs: 28, md: 38 },
                    fontWeight: 800,
                    lineHeight: 1.08,
                    letterSpacing: 0,
                    color: "#111827",
                    maxWidth: 420,
                  }}
                >
                  Masuk ke layanan PMCare
                </FontStyle>
                <FontStyle
                  sx={{
                    mt: 1.2,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "rgba(35,35,35,0.62)",
                    lineHeight: 1.7,
                    maxWidth: 430,
                  }}
                >
                  Akses laporan, tiket, dan informasi layanan sesuai peran akun
                  Anda.
                </FontStyle>
              </Box>
            </Stack>

            <Stack spacing={1.2}>
              {loginHighlights.map((item) => (
                <Box
                  key={item.title}
                  sx={{
                    p: 1.35,
                    borderRadius: 2,
                    border: "1px solid rgba(15,23,42,0.08)",
                    bgcolor: "rgba(255,255,255,0.74)",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.2,
                  }}
                >
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 1.8,
                      display: "grid",
                      placeItems: "center",
                      color:
                        item.icon === "mdi:view-dashboard-outline"
                          ? "#2563EB"
                          : theme.palette.primary.main,
                      bgcolor:
                        item.icon === "mdi:view-dashboard-outline"
                          ? "rgba(37,99,235,0.10)"
                          : alpha(theme.palette.primary.main, 0.1),
                      flexShrink: 0,
                    }}
                  >
                    <Icon icon={item.icon} fontSize={22} />
                  </Box>
                  <Box minWidth={0}>
                    <FontStyle sx={{ fontSize: 13, fontWeight: 900 }}>
                      {item.title}
                    </FontStyle>
                    <FontStyle
                      sx={{
                        mt: 0.2,
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: "rgba(35,35,35,0.55)",
                        lineHeight: 1.45,
                      }}
                    >
                      {item.description}
                    </FontStyle>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              p: { xs: 2.4, md: 3.5 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minHeight: { xs: "auto", md: 560 },
            }}
          >
            <Stack spacing={2.4}>
              <Stack alignItems="center" spacing={5}>
                <Image
                  src="/logo-pm-ticketing1.png"
                  alt="logo-pm-ticketing"
                  width={isMobile ? 126 : 150}
                  height={isMobile ? 72 : 86}
                  loading="eager"
                  priority
                />
                <Box textAlign="center">
                  <FontStyle
                    sx={{
                      mt: 0.4,
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "rgba(35,35,35,0.55)",
                    }}
                  >
                    Masukkan username dan password terdaftar.
                  </FontStyle>
                </Box>
              </Stack>

              <Box
                component="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin();
                }}
              >
                <Stack spacing={1.6}>
                  <TextField
                    label="Username"
                    placeholder="Masukkan username Anda"
                    variant="filled"
                    fullWidth
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={disabled}
                    color="primary"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon
                            icon="mdi:account-outline"
                            fontSize={19}
                            color={theme.palette.primary.main}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    label="Password"
                    placeholder="Masukkan password Anda"
                    variant="filled"
                    fullWidth
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={disabled}
                    color="primary"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon
                            icon="mdi:lock-outline"
                            fontSize={18}
                            color={theme.palette.primary.main}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPass((current) => !current)}
                            edge="end"
                            disabled={disabled}
                          >
                            <Icon
                              icon={
                                showPass
                                  ? "line-md:watch-twotone-loop"
                                  : "line-md:watch-off-loop"
                              }
                              style={{ color: theme.palette.primary.main }}
                              fontSize={25}
                            />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      variant="text"
                      onClick={handleForgotPassword}
                      disabled={disabled}
                      sx={{
                        minWidth: 0,
                        px: 0,
                        fontFamily: "Poppins, sans-serif",
                        fontSize: 12.5,
                        fontWeight: 600,
                        textTransform: "none",
                        color: "rgba(35,35,35,0.56)",
                        "&:hover": {
                          color: theme.palette.primary.main,
                          bgcolor: "transparent",
                        },
                      }}
                    >
                      Lupa Password?
                    </Button>
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<Icon icon="mdi:login-variant" />}
                    sx={{
                      mt: 0.6,
                      py: 1.2,
                      borderRadius: 1.7,
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 600,
                      fontSize: 15,
                      textTransform: "none",
                      boxShadow: "0 8px 18px rgba(230,9,9,0.24)",
                    }}
                    disabled={disabled}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </Stack>
              </Box>

              <Divider
                sx={{
                  fontFamily: "Poppins, sans-serif",
                  color: "text.disabled",
                  fontWeight: 700,
                  fontSize: 11,
                }}
              >
                Atau
              </Divider>

              <Stack spacing={1.5}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleRedirect}
                  disabled={disabled}
                  startIcon={<Icon icon="mdi:account-plus-outline" />}
                  sx={{
                    py: 1.05,
                    borderRadius: 2,
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 600,
                    textTransform: "none",
                    color: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      boxShadow: "0 8px 18px rgba(230,9,9,0.08)",
                    },
                  }}
                >
                  Daftar akun baru
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleRedirectBeranda}
                  disabled={disabled}
                  startIcon={<Icon icon="mdi:home-outline" />}
                  sx={{
                    py: 1,
                    borderRadius: 2,
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 600,
                    textTransform: "none",
                    color: "rgba(35,35,35,0.68)",
                    borderColor: "rgba(15,23,42,0.12)",
                    bgcolor: "rgba(255,255,255,0.72)",
                    boxShadow: "none",
                    "&:hover": {
                      color: theme.palette.primary.main,
                      borderColor: alpha(theme.palette.primary.main, 0.28),
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      boxShadow: "0 8px 18px rgba(15,23,42,0.06)",
                    },
                  }}
                >
                  Kembali ke Beranda
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Box>

      <Footer />

      <Notification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />

      <LoadingBackdrop open={redirecting} message="Loading..." />
    </Box>
  );
};

export default LoginPage;
