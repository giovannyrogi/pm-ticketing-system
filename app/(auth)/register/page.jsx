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
  Grid,
} from "@mui/material";
import { Icon } from "@iconify/react";
import axios from "axios";
import Image from "next/image";
import Notification from "@/app/components/notification/Notification";
import LoadingBackdrop from "@/app/components/loading/Backdrop";
import Footer from "@/app/components/footer/page";
import Link from "next/link";
import SuccessRegistration from "./SuccessRegistration";

const RegisterPage = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const router = useRouter();
  const theme = useTheme();
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [loading, setLoading] = useState(false); // loading saat klik login
  const [redirecting, setRedirecting] = useState(false); // loading saat pindah page
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [openSuccessRegistrationModal, setOpenSuccessRegistrationModal] =
    useState(false);
  const [dataUser, setDataUser] = useState(null);

  const handleRegister = async () => {
    setLoading(true);
    setRedirecting(true);

    if (konfirmasiPassword !== password) {
      setSnackbar({
        open: true,
        message: "Password dan Konfirmasi Password tidak cocok",
        severity: "error",
      });
      setLoading(false);
      setRedirecting(false);
      return;
    }

    try {
      const response = await axios.post("/api/register", {
        fullName,
        username,
        password,
        email,
        phoneNumber,
      });

      console.log("response", response);

      if (response?.data?.success) {
        setSnackbar({
          open: true,
          message: "Pendaftaran akun berhasil!",
          severity: "success",
        });

        setDataUser(response?.data?.data);
        setTimeout(() => {
          setOpenSuccessRegistrationModal(true);
          setLoading(false);
          setRedirecting(false);
        }, 800);
      } else {
        setSnackbar({
          open: true,
          message: response?.message || "Registrasi gagal!",
          severity: "error",
        });
        setLoading(false);
        setRedirecting(false);
      }
    } catch (err) {
      console.log("err", err);
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
      router.push("/login");
    }, 1000);
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
        // backgroundSize: "cover",
        // backgroundPosition: "center",
        // backgroundRepeat: "no-repeat",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: isMobile ? 400 : 600,
          borderRadius: 3,
          bgcolor: "background.default",
          boxShadow: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            mb: 4,
          }}
        >
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontSize: 24,
              fontWeight: 600,
            }}
          >
            Daftar Akun Baru
          </Typography>
        </Box>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister();
          }}
        >
          <Grid container columnSpacing={2} rowSpacing={1}>
            <Grid size={isMobile ? 12 : 6}>
              <TextField
                label="Nama Lengkap"
                variant="filled"
                fullWidth
                margin="normal"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoFocus
                required
                disabled={loading || redirecting}
                color="primary"
              />
            </Grid>
            <Grid size={isMobile ? 12 : 6}>
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
            </Grid>
            <Grid size={isMobile ? 12 : 6}>
              <TextField
                label="Email"
                variant="filled"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
                disabled={loading || redirecting}
                color="primary"
              />
            </Grid>
            <Grid size={isMobile ? 12 : 6}>
              <TextField
                label="Nomor Telepon"
                variant="filled"
                fullWidth
                margin="normal"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                autoFocus
                required
                disabled={loading || redirecting}
                color="primary"
              />
            </Grid>
            <Grid size={isMobile ? 12 : 6}>
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
            </Grid>
            <Grid size={isMobile ? 12 : 6}>
              <TextField
                label="Konfirmasi Password"
                variant="filled"
                fullWidth
                margin="normal"
                type={showPass2 ? "text" : "password"}
                value={konfirmasiPassword}
                onChange={(e) => setKonfirmasiPassword(e.target.value)}
                required
                disabled={loading || redirecting}
                color="primary"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPass2(!showPass2)}
                        edge="end"
                        disabled={loading || redirecting}
                      >
                        {showPass2 ? (
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
            </Grid>
            <Grid size={12}>
              <Typography
                sx={{
                  fontSize: 13,
                  mt: 0.5,
                  mb: 3,
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  color: "text.disabled",
                }}
              >
                Sudah punya akun?
                <span
                  onClick={handleRedirect}
                  style={{
                    color: theme.palette.primary.main,
                    fontWeight: "bold",
                    cursor: "pointer",
                    marginLeft: 5,
                  }}
                >
                  Login
                </span>
              </Typography>
            </Grid>
            <Grid size={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="small"
                fullWidth
                sx={{
                  fontWeight: "bold",
                  fontSize: 16,
                  textTransform: "none",
                }}
                disabled={loading || redirecting}
                startIcon={
                  loading && <CircularProgress size={22} color="inherit" />
                }
              >
                {loading ? "Loading..." : "Daftar Sekarang"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Footer  */}
      <Footer />

      {/* Loading backdrop */}
      <LoadingBackdrop open={redirecting} message="Loading..." />

      <SuccessRegistration
        open={openSuccessRegistrationModal}
        onClose={() => setOpenSuccessRegistrationModal(false)}
        dataUser={dataUser}
        loading={loading}
        redirecting={redirecting}
        setRedirectingTrue={() => setRedirecting(true)}
        setRedirectingFalse={() => setRedirecting(false)}
        setLoadingTrue={() => setLoading(true)}
        setLoadingFalse={() => setLoading(false)}
      />

      {/* Snackbar notification */}
      <Notification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default RegisterPage;
