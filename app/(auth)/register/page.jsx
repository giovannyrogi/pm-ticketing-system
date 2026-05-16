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
  useTheme,
  Grid,
  Stack,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Icon } from "@iconify/react";
import axios from "axios";
import AuthPageHeader from "@/app/components/auth/AuthPageHeader";
import Notification from "@/app/components/notification/Notification";
import LoadingBackdrop from "@/app/components/loading/Backdrop";
import Footer from "@/app/components/footer/page";
import SuccessRegistration from "./SuccessRegistration";
import {
  AUTH_VALIDATION_LIMITS,
  removeSpaces,
  validateAuthEmail,
  validateAuthPassword,
  validateFullName,
  validatePasswordConfirmation,
  validateUsername,
} from "@/app/utils/authValidation";
import {
  sanitizePhoneNumber,
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
  const [fullNameError, setFullNameError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [konfirmasiPasswordError, setKonfirmasiPasswordError] = useState("");
  const [openOtpModal, setOpenOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpExpiredAt, setOtpExpiredAt] = useState(null);
  const [isOTPActive, setIsOTPActive] = useState(false);

  const [resendAvailableAt, setResendAvailableAt] = useState(null);
  const [otpRemainingTime, setOtpRemainingTime] = useState(0);
  const fieldHelperTextProps = {
    sx: {
      ml: 0,
      mr: 0,
      fontFamily: "Poppins",
      fontWeight: 500,
      fontSize: 12,
      lineHeight: 1.5,
    },
  };

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

  const handleFullNameChange = (e) => {
    const value = e.target.value;

    setFullName(value);
    setFullNameError(value ? validateFullName(value) : "");
  };

  const handleUsernameChange = (e) => {
    const value = removeSpaces(e.target.value);

    setUsername(value);
    setUsernameError(value ? validateUsername(value) : "");
  };

  const handleEmailChange = (e) => {
    const value = removeSpaces(e.target.value);

    setEmail(value);

    setEmailError(value ? validateAuthEmail(value) : "");
  };

  const handlePasswordChange = (e) => {
    const value = removeSpaces(e.target.value);

    setPassword(value);
    setPasswordError(value ? validateAuthPassword(value) : "");

    if (konfirmasiPassword) {
      setKonfirmasiPasswordError(
        validatePasswordConfirmation(value, konfirmasiPassword),
      );
    }
  };

  const handleKonfirmasiPasswordChange = (e) => {
    const value = removeSpaces(e.target.value);

    setKonfirmasiPassword(value);
    setKonfirmasiPasswordError(
      value ? validatePasswordConfirmation(password, value) : "",
    );
  };

  const validateRegisterForm = () => {
    const validations = {
      fullName: validateFullName(fullName),
      username: validateUsername(username),
      email: validateAuthEmail(email),
      phone:
        validatePhoneNumber(phoneNumber) ||
        (!phoneNumber ? "Nomor telepon harus diisi" : ""),
      password: validateAuthPassword(password),
      konfirmasiPassword: validatePasswordConfirmation(
        password,
        konfirmasiPassword,
      ),
    };

    setFullNameError(validations.fullName);
    setUsernameError(validations.username);
    setEmailError(validations.email);
    setPhoneError(validations.phone);
    setPasswordError(validations.password);
    setKonfirmasiPasswordError(validations.konfirmasiPassword);

    return Object.values(validations).find(Boolean) || "";
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

    const validationMessage = validateRegisterForm();

    if (validationMessage) {
      setSnackbar({
        open: true,
        message: validationMessage,
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
        background:
          "linear-gradient(135deg, rgba(230,9,9,0.05) 0%, #FFFFFF 46%, rgba(22,163,74,0.06) 100%)",

        display: "flex",

        alignItems: "center",

        justifyContent: "space-between",

        flexDirection: "column",

        transition: "all 0.3s",

        overflowY: "auto",

        px: { xs: 1.6, md: 2.4 },
      }}
    >
      <Box
        sx={{
          flex: 1,

          width: "100%",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          pt: { xs: 3, md: 5 },
          pb: { xs: 5, md: 5 },
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: "100%",

            maxWidth: 980,

            borderRadius: 3,

            bgcolor: "background.default",

            boxShadow: "0 22px 58px rgba(15, 23, 42, 0.12)",
            overflow: "hidden",
            border: "1px solid rgba(15, 23, 42, 0.10)",
          }}
        >
          <AuthPageHeader
            badge="Buat Akun PMCare"
            title="Daftar Akun Baru"
            description="Lengkapi data akun untuk membuat laporan, memantau tiket, dan menerima verifikasi melalui WhatsApp."
            showLogoOnMobile={false}
          />
          <Box sx={{ p: { xs: 2.4, md: 3.4 } }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRegister();
              }}
            >
              <Grid container rowGap={2.4} spacing={2}>
                <Grid size={12}>
                  <TextField
                    label="Nama Lengkap"
                    placeholder="John Doe"
                    variant="filled"
                    fullWidth
                    value={fullName}
                    onChange={handleFullNameChange}
                    required
                    disabled={loading || redirecting}
                    color="primary"
                    error={!!fullNameError}
                    helperText={fullNameError}
                    FormHelperTextProps={fieldHelperTextProps}
                    inputProps={{
                      maxLength: AUTH_VALIDATION_LIMITS.fullNameMax,
                    }}
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
                </Grid>
                <Grid size={isMobile ? 12 : 6}>
                  <TextField
                    label="Username"
                    placeholder="johndoe"
                    variant="filled"
                    fullWidth
                    value={username}
                    onChange={handleUsernameChange}
                    required
                    disabled={loading || redirecting}
                    color="primary"
                    error={!!usernameError}
                    helperText={usernameError}
                    FormHelperTextProps={fieldHelperTextProps}
                    inputProps={{
                      maxLength: AUTH_VALIDATION_LIMITS.usernameMax,
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon
                            icon="mdi:account-badge-outline"
                            fontSize={19}
                            color={theme.palette.primary.main}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid size={isMobile ? 12 : 6}>
                  <TextField
                    label="Email"
                    placeholder="Cth : name@example.com"
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
                    inputProps={{
                      maxLength: AUTH_VALIDATION_LIMITS.emailMax,
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon
                            icon="mdi:email-outline"
                            fontSize={19}
                            color={theme.palette.primary.main}
                          />
                        </InputAdornment>
                      ),
                    }}
                    FormHelperTextProps={fieldHelperTextProps}
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
                    FormHelperTextProps={fieldHelperTextProps}
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
                    placeholder="Password minimal 6 karakter"
                    variant="filled"
                    fullWidth
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    disabled={loading || redirecting}
                    color="primary"
                    error={!!passwordError}
                    helperText={passwordError}
                    FormHelperTextProps={fieldHelperTextProps}
                    inputProps={{
                      maxLength: AUTH_VALIDATION_LIMITS.passwordMax,
                    }}
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
                    placeholder="Password minimal 6 karakter"
                    variant="filled"
                    fullWidth
                    type={showPass2 ? "text" : "password"}
                    value={konfirmasiPassword}
                    onChange={handleKonfirmasiPasswordChange}
                    required
                    disabled={loading || redirecting}
                    color="primary"
                    error={!!konfirmasiPasswordError}
                    helperText={konfirmasiPasswordError}
                    FormHelperTextProps={fieldHelperTextProps}
                    inputProps={{
                      maxLength: AUTH_VALIDATION_LIMITS.passwordMax,
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon
                            icon="mdi:lock-check-outline"
                            fontSize={18}
                            color={theme.palette.primary.main}
                          />
                        </InputAdornment>
                      ),
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
                  <Box
                    sx={{
                      mt: 0.2,
                      p: 1.35,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "flex-start", sm: "center" },
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontFamily: "Poppins",
                        fontWeight: 600,
                        color: "rgba(35,35,35,0.62)",
                      }}
                    >
                      Sudah punya akun?
                    </Typography>
                    <Button
                      variant="text"
                      onClick={handleRedirect}
                      disabled={loading || redirecting}
                      startIcon={<Icon icon="mdi:login-variant" />}
                      sx={{
                        minWidth: 0,
                        px: 0,
                        py: 0,
                        fontSize: 13,
                        fontFamily: "Poppins",
                        fontWeight: 800,
                        color: theme.palette.primary.main,
                        textTransform: "none",
                        "&:hover": {
                          bgcolor: "transparent",
                          color: theme.palette.primary.dark,
                        },
                      }}
                    >
                      Login
                    </Button>
                  </Box>
                </Grid>
                <Grid size={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    // startIcon={<Icon icon="mdi:account-plus-outline" />}
                    sx={{
                      py: 1.2,
                      borderRadius: 1.8,
                      fontFamily: "Poppins",
                      fontWeight: 600,
                      fontSize: 16,
                      textTransform: "none",
                      boxShadow: "0 8px 18px rgba(230,9,9,0.24)",
                    }}
                    disabled={loading || redirecting}
                  >
                    {loading ? "Loading..." : "Daftar Sekarang"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Box>
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
