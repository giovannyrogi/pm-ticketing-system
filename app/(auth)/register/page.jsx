"use client";
import { useEffect, useState } from "react";
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
  ButtonBase,
} from "@mui/material";
import { Icon } from "@iconify/react";
import axios from "axios";
import Image from "next/image";
import Notification from "@/app/components/notification/Notification";
import LoadingBackdrop from "@/app/components/loading/Backdrop";
import Footer from "@/app/components/footer/page";
import Link from "next/link";
import SuccessRegistration from "./SuccessRegistration";
import {
  emailRegex,
  phoneRegex,
  sanitizePhoneNumber,
  validateEmail,
  validatePhoneNumber,
} from "@/app/utils/validationTextField";
import OTPVerificationModal from "@/app/components/otp-verification-modal/OTPVerificationModal";
import {
  saveOTPSession,
  getOTPSession,
  clearOTPSession,
} from "@/app/utils/otpSession";

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
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [openOtpModal, setOpenOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpExpiredAt, setOtpExpiredAt] = useState(null);
  const [isOTPActive, setIsOTPActive] = useState(false);

  const [resendAvailableAt, setResendAvailableAt] = useState(null);
  const [otpRemainingTime, setOtpRemainingTime] = useState(0);

  useEffect(() => {
    if (!otpExpiredAt) return;

    const interval = setInterval(() => {
      if (new Date() > new Date(otpExpiredAt)) {
        /**
         * =========================
         * CLEAR SESSION
         * =========================
         */
        clearOTPSession();

        /**
         * =========================
         * UNLOCK PHONE INPUT
         * =========================
         */
        setIsOTPActive(false);

        /**
         * =========================
         * RESET EXPIRED STATE
         * =========================
         */
        setOtpExpiredAt(null);

        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [otpExpiredAt]);

  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);

    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!otpExpiredAt) {
      setOtpRemainingTime(0);

      return;
    }

    const updateCountdown = () => {
      const diff = Math.floor((new Date(otpExpiredAt) - new Date()) / 1000);

      setOtpRemainingTime(diff > 0 ? diff : 0);
    };

    /**
     * INITIAL RUN
     */
    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [otpExpiredAt]);

  useEffect(() => {
    const otpSession = getOTPSession();

    if (!otpSession) return;

    /**
     * =========================
     * OTP EXPIRED
     * =========================
     */
    if (new Date() > new Date(otpSession.expiredAt)) {
      clearOTPSession();

      setIsOTPActive(false);

      return;
    }

    /**
     * =========================
     * RESTORE FORM DATA
     * =========================
     */
    setFullName(otpSession.fullName || "");

    setUsername(otpSession.username || "");

    setPassword(otpSession.password || "");

    setKonfirmasiPassword(otpSession.konfirmasiPassword || "");

    setEmail(otpSession.email || "");

    setPhoneNumber(otpSession.phoneNumber || "");

    /**
     * =========================
     * RESTORE OTP SESSION
     * =========================
     */
    setOtpExpiredAt(otpSession.expiredAt);

    setResendAvailableAt(otpSession.resendAvailableAt);

    setOpenOtpModal(true);

    setIsOTPActive(true);
  }, []);

  const handlePhoneNumberChange = (e) => {
    let value = e.target.value;

    /**
     * =========================
     * ONLY NUMBER
     * =========================
     */
    value = sanitizePhoneNumber(value);

    /**
     * =========================
     * BLOCK PREFIX 0
     * =========================
     */
    if (value.startsWith("0")) {
      return;
    }

    /**
     * =========================
     * REMOVE PREFIX 62
     * =========================
     */
    if (value.startsWith("62")) {
      value = value.slice(2);
    }

    /**
     * =========================
     * MAX LENGTH
     * =========================
     */
    if (value.length > 14) {
      return;
    }

    setPhoneNumber(value);

    /**
     * =========================
     * VALIDATION
     * =========================
     */
    setPhoneError(validatePhoneNumber(value));
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;

    setEmail(value);

    setEmailError(validateEmail(value));
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setRedirecting(true);
    try {
      const response = await axios.post("/api/register/send-otp", {
        fullName,
        username,
        password,
        email,
        phoneNumber: `${phoneNumber}`,
      });

      setOtpExpiredAt(response.data.expiredAt);

      setResendAvailableAt(response.data.resendAvailableAt);

      saveOTPSession({
        fullName,
        username,
        password,
        konfirmasiPassword,
        email,
        phoneNumber,

        expiredAt: response.data.expiredAt,

        resendAvailableAt: response.data.resendAvailableAt,
      });

      setTimeout(() => {
        setLoading(false);
        setRedirecting(false);
        setSnackbar({
          open: true,
          message: "Kode OTP berhasil dikirim ulang",
          severity: "success",
        });

        setIsOTPActive(true);
      }, 800);
    } catch (error) {
      // console.log("error", error);
      setTimeout(() => {
        setLoading(false);
        setRedirecting(false);
        setSnackbar({
          open: true,
          message: error?.response?.data?.message,
          severity: "error",
        });
      }, 800);
    }
  };

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

    /**
     * =========================
     * EMAIL VALIDATION
     * =========================
     */
    const emailValidation = validateEmail(email);

    if (emailValidation) {
      setSnackbar({
        open: true,
        message: emailValidation,
        severity: "error",
      });

      setLoading(false);
      setRedirecting(false);

      return;
    }

    /**
     * =========================
     * PHONE VALIDATION
     * =========================
     */
    const phoneValidation = validatePhoneNumber(phoneNumber);

    if (phoneValidation) {
      setSnackbar({
        open: true,
        message: phoneValidation,
        severity: "error",
      });

      setLoading(false);
      setRedirecting(false);
      return;
    }

    const prefixedPhoneNumber = `62${phoneNumber}`;

    try {
      const response = await axios.post("/api/register/send-otp", {
        fullName,
        username,
        password,
        email,
        phoneNumber: prefixedPhoneNumber,
      });

      if (response?.data?.success) {
        setTimeout(() => {
          setLoading(false);
          setRedirecting(false);
          setOtpExpiredAt(response.data.expiredAt);

          setResendAvailableAt(response.data.resendAvailableAt);

          saveOTPSession({
            fullName,
            username,
            password,
            konfirmasiPassword,
            email,
            expiredAt: response.data.expiredAt,

            resendAvailableAt: response.data.resendAvailableAt,

            phoneNumber: phoneNumber,
          });

          setOpenOtpModal(true);
          setIsOTPActive(true);
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
      // console.log("err", err?.response);
      if (err?.response?.status === 429) {
        const data = err.response.data;

        setOtpExpiredAt(data.expiredAt);

        setResendAvailableAt(data.resendAvailableAt);

        setOpenOtpModal(true);

        saveOTPSession({
          fullName,
          username,
          password,
          email,
          phoneNumber,
          konfirmasiPassword,
          expiredAt: data.expiredAt,

          resendAvailableAt: data.resendAvailableAt,
        });
        setSnackbar({
          open: true,
          message: err.response?.data?.message || "Login gagal!",
          severity: "info",
        });
        setLoading(false);
        setRedirecting(false);
        return;
      }
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Login gagal!",
        severity: "error",
      });
      setLoading(false);
      setRedirecting(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setLoading(true);

      const response = await axios.post("/api/register/verify-otp", {
        fullName,
        username,
        password,
        email,
        phoneNumber,
        otpCode,
      });

      if (response?.data?.success) {
        /**
         * =========================
         * CLEAR OTP SESSION
         * =========================
         */
        clearOTPSession();

        setOpenOtpModal(false);

        setDataUser(response?.data?.data);

        setOpenSuccessRegistrationModal(true);

        setSnackbar({
          open: true,
          message: "Registrasi berhasil",
          severity: "success",
        });

        setIsOTPActive(false);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || "Verifikasi OTP gagal",
        severity: "error",
      });
    } finally {
      setLoading(false);
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
        minHeight: "100vh",

        bgcolor: "background.default",

        display: "flex",

        alignItems: "center",

        justifyContent: "space-between",

        flexDirection: "column",

        transition: "all 0.3s",

        overflowY: "auto",

        pl: 2,
        pr: 2,
      }}
    >
      <Box
        sx={{
          flex: 1,

          width: "100%",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",
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
            <Grid container rowGap={3} spacing={2}>
              <Grid size={12}>
                <TextField
                  label="Nama Lengkap"
                  variant="filled"
                  fullWidth
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
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
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading || redirecting}
                  color="primary"
                />
              </Grid>
              <Grid size={isMobile ? 12 : 6}>
                <TextField
                  label="Email"
                  type="email"
                  variant="filled"
                  fullWidth
                  value={email}
                  onChange={handleEmailChange}
                  autoComplete="email"
                  required
                  disabled={loading || redirecting}
                  color="primary"
                  error={!!emailError}
                  helperText={emailError}
                  FormHelperTextProps={{
                    sx: {
                      ml: 0,
                      mr: 0,
                      textFamily: "Poppins",
                      fontWeight: "500",
                      fontSize: 13,
                    },
                  }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Nomor Telepon"
                  placeholder="Cth : 82187xxxxxx"
                  variant="filled"
                  fullWidth
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  required
                  disabled={loading || redirecting || isOTPActive}
                  color="primary"
                  error={!!phoneError}
                  helperText={
                    phoneError ? (
                      phoneError
                    ) : isOTPActive && otpRemainingTime > 0 ? (
                      <Typography
                        component="span"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.7,

                          mt: 0.3,

                          fontSize: 12,

                          fontWeight: 600,

                          fontFamily: "Poppins",

                          color: "warning.main",
                        }}
                      >
                        Nomor telepon terkunci sementara selama proses
                        verifikasi OTP ({formatCountdown(otpRemainingTime)})
                      </Typography>
                    ) : null
                  }
                  FormHelperTextProps={{
                    sx: {
                      ml: 0,
                      mr: 0,
                      textFamily: "Poppins",
                      fontWeight: 500,
                      fontSize: 12,
                      lineHeight: 1.5,
                    },
                  }}
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    maxLength: 14,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography
                          sx={{
                            color: "text.primary",
                            fontWeight: 500,
                            fontSize: 14,
                            fontFamily: "Poppins",
                          }}
                        >
                          +62
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={isMobile ? 12 : 6}>
                <TextField
                  label="Password"
                  variant="filled"
                  fullWidth
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
                >
                  {loading ? "Loading..." : "Daftar Sekarang"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>

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

      <OTPVerificationModal
        open={openOtpModal}
        onClose={() => {
          setOpenOtpModal(false);
        }}
        otpCode={otpCode}
        setOtpCode={setOtpCode}
        onSubmit={handleVerifyOTP}
        onResend={handleResendOTP}
        expiredAt={otpExpiredAt}
        resendAvailableAt={resendAvailableAt}
        loading={loading}
        otpLength={6}
        title="Verifikasi Nomor WhatsApp"
        description="Masukkan kode OTP yang telah dikirimkan ke nomor WhatsApp Anda untuk melanjutkan proses pendaftaran akun PMCare."
        phoneNumber={`+62${phoneNumber}`}
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
