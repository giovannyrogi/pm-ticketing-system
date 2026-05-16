"use client";

import AuthPageHeader from "@/app/components/auth/AuthPageHeader";
import FontStyle from "@/app/components/font-style/FontStyle";
import Footer from "@/app/components/footer/page";
import LoadingBackdrop from "@/app/components/loading/Backdrop";
import Notification from "@/app/components/notification/Notification";
import OTPVerificationModal from "@/app/components/otp-verification-modal/OTPVerificationModal";
import {
  clearForgotPasswordOTPSession,
  getForgotPasswordOTPSessionByAccountId,
  getForgotPasswordOTPSession,
  saveForgotPasswordOTPSession,
} from "@/app/utils/forgotPasswordOtpSession";
import {
  removeSpaces,
  validateAuthPassword,
  validatePasswordConfirmation,
} from "@/app/utils/authValidation";
import { sanitizePhoneNumber } from "@/app/utils/validationTextField";
import { Icon } from "@iconify/react";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EMPTY_PASSWORD_FORM = {
  newPassword: "",
  confirmPassword: "",
};
const SMOOTH_LOADING_MS = 1000;

const waitForSmoothLoading = (startedAt) =>
  new Promise((resolve) => {
    const remaining = Math.max(SMOOTH_LOADING_MS - (Date.now() - startedAt), 0);
    setTimeout(resolve, remaining);
  });

const getActiveForgotPasswordSession = () => {
  const otpSession = getForgotPasswordOTPSession();

  if (!otpSession) return null;

  if (new Date() > new Date(otpSession.expiredAt)) {
    clearForgotPasswordOTPSession(otpSession.account?.id);
    return null;
  }

  return otpSession;
};

const phonePrefixAdornment = (
  <Typography
    sx={{
      color: "text.primary",
      fontWeight: 700,
      fontSize: 14,
      fontFamily: "Poppins, sans-serif",
    }}
  >
    +62
  </Typography>
);

const ForgotPasswordPage = () => {
  const router = useRouter();
  const theme = useTheme();
  const [lookupMethod, setLookupMethod] = useState("account");
  const [identifier, setIdentifier] = useState("");
  const [phoneIdentifier, setPhoneIdentifier] = useState("");
  const [account, setAccount] = useState(null);
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpExpiredAt, setOtpExpiredAt] = useState(null);
  const [otpRemainingSeconds, setOtpRemainingSeconds] = useState(0);
  const [resendAvailableAt, setResendAvailableAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const currentAccountId = account?.id;

  const showMessage = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const runWithSmoothLoading = async (message, task) => {
    const startedAt = Date.now();
    setLoading(true);
    setLoadingMessage(message);

    try {
      return await task();
    } finally {
      await waitForSmoothLoading(startedAt);
      setLoading(false);
      setLoadingMessage("Loading...");
    }
  };

  const persistActiveOtpSession = (overrides = {}) => {
    const nextExpiredAt = overrides.expiredAt || otpExpiredAt;

    if (!nextExpiredAt || new Date() > new Date(nextExpiredAt)) return;

    saveForgotPasswordOTPSession({
      lookupMethod,
      identifier: lookupIdentifier,
      phoneIdentifier,
      account,
      passwordForm,
      expiredAt: nextExpiredAt,
      resendAvailableAt,
      ...overrides,
    });
  };

  useEffect(() => {
    const otpSession = getActiveForgotPasswordSession();

    if (!otpSession) return;

    setLookupMethod(otpSession.lookupMethod || "account");
    setIdentifier(
      otpSession.lookupMethod === "phone" ? "" : otpSession.identifier || "",
    );
    setPhoneIdentifier(
      otpSession.lookupMethod === "phone"
        ? otpSession.phoneIdentifier || otpSession.identifier || ""
        : "",
    );
    setAccount(otpSession.account || null);
    setPasswordForm(otpSession.passwordForm || EMPTY_PASSWORD_FORM);
    setOtpExpiredAt(otpSession.expiredAt);
    setResendAvailableAt(otpSession.resendAvailableAt);
    setOtpOpen(true);
  }, []);

  useEffect(() => {
    if (!otpExpiredAt) {
      setOtpRemainingSeconds(0);
      return;
    }

    const updateCountdown = () => {
      const diff = Math.floor((new Date(otpExpiredAt) - new Date()) / 1000);
      setOtpRemainingSeconds(diff > 0 ? diff : 0);

      if (diff <= 0) {
        clearForgotPasswordOTPSession(currentAccountId);
        setOtpExpiredAt(null);
        setResendAvailableAt(null);
      }
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [currentAccountId, otpExpiredAt]);

  const lookupIdentifier =
    lookupMethod === "phone" ? phoneIdentifier : identifier.trim();
  const hasActiveOtp = Boolean(otpExpiredAt && otpRemainingSeconds > 0);
  const otpCountdownLabel = `${Math.floor(otpRemainingSeconds / 60)}:${String(
    otpRemainingSeconds % 60,
  ).padStart(2, "0")}`;

  const handleLookupMethodChange = (_, value) => {
    if (!value) return;

    setLookupMethod(value);
    setIdentifier("");
    setPhoneIdentifier("");
  };

  const handlePhoneIdentifierChange = (e) => {
    setPhoneIdentifier(sanitizePhoneNumber(e.target.value));
  };

  const handleLookupAccount = async () => {
    if (!lookupIdentifier) {
      showMessage("Email, username, atau nomor telepon harus diisi", "error");
      return;
    }

    try {
      const res = await runWithSmoothLoading("Mencari akun...", () =>
        axios.post("/api/forgot-password/lookup", {
          identifier: lookupIdentifier,
        }),
      );

      if (res.data.success) {
        const matchedSession = getForgotPasswordOTPSessionByAccountId(
          res.data.data.id,
        );

        setAccount(res.data.data);
        setOtpCode("");

        if (matchedSession) {
          setPasswordForm(matchedSession.passwordForm || EMPTY_PASSWORD_FORM);
          setOtpExpiredAt(matchedSession.expiredAt);
          setResendAvailableAt(matchedSession.resendAvailableAt);
          return;
        }

        setPasswordForm(EMPTY_PASSWORD_FORM);
        setOtpExpiredAt(null);
        setResendAvailableAt(null);
      }
    } catch (err) {
      setAccount(null);
      showMessage(
        err?.response?.data?.message || "Gagal mencari akun",
        "error",
      );
    }
  };

  const validatePasswordForm = () => {
    const passwordError = validateAuthPassword(
      passwordForm.newPassword,
      "Password baru",
    );

    if (passwordError) {
      showMessage(passwordError, "error");
      return false;
    }

    const confirmationError = validatePasswordConfirmation(
      passwordForm.newPassword,
      passwordForm.confirmPassword,
    );

    if (confirmationError) {
      showMessage(confirmationError, "error");
      return false;
    }

    return true;
  };

  const requestResetOtp = async () => {
    if (!account) {
      showMessage("Cari akun terlebih dahulu", "error");
      return;
    }

    if (!validatePasswordForm()) return;

    try {
      const res = await runWithSmoothLoading("Mengirim kode OTP...", () =>
        axios.post("/api/forgot-password/send-otp", {
          identifier: lookupIdentifier,
        }),
      );

      if (res.data.success) {
        setOtpExpiredAt(res.data.expiredAt);
        setResendAvailableAt(res.data.resendAvailableAt);
        setOtpCode("");
        setOtpOpen(true);
        saveForgotPasswordOTPSession({
          identifier: lookupIdentifier,
          lookupMethod,
          phoneIdentifier,
          account: res.data.data || account,
          passwordForm,
          expiredAt: res.data.expiredAt,
          resendAvailableAt: res.data.resendAvailableAt,
        });
      }
    } catch (err) {
      const data = err?.response?.data;

      if (data?.expiredAt) {
        setOtpExpiredAt(data.expiredAt);
        setResendAvailableAt(data.resendAvailableAt);
        setOtpOpen(true);
        saveForgotPasswordOTPSession({
          identifier: lookupIdentifier,
          lookupMethod,
          phoneIdentifier,
          account: data.data || account,
          passwordForm,
          expiredAt: data.expiredAt,
          resendAvailableAt: data.resendAvailableAt,
        });
      }

      if (!data?.expiredAt) {
        showMessage(data?.message || "Gagal mengirim OTP", "error");
      }
    }
  };

  const handleResetPassword = async () => {
    if (!validatePasswordForm()) {
      setOtpOpen(false);
      return;
    }

    if (otpCode.length !== 6) {
      showMessage("Kode OTP harus 6 digit", "error");
      return;
    }

    try {
      const res = await runWithSmoothLoading("Mereset password...", () =>
        axios.post("/api/forgot-password/reset", {
          identifier: lookupIdentifier,
          otpCode,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      );

      if (res.data.success) {
        clearForgotPasswordOTPSession(account?.id);
        setOtpOpen(false);
        setOtpCode("");
        setPasswordForm(EMPTY_PASSWORD_FORM);
        showMessage(res.data.message, "success");
        setTimeout(() => router.push("/login"), 1100);
      }
    } catch (err) {
      showMessage(
        err?.response?.data?.message || "Gagal mereset password",
        "error",
      );
    }
  };

  const handleUseDifferentAccount = () => {
    setLoading(true);
    setLoadingMessage("Menyiapkan pencarian akun...");

    setTimeout(() => {
      const activeSession = getActiveForgotPasswordSession();

      setAccount(null);
      setIdentifier("");
      setPhoneIdentifier("");
      setLookupMethod("account");
      setOtpCode("");
      setOtpOpen(false);

      if (!activeSession) {
        setPasswordForm(EMPTY_PASSWORD_FORM);
        setOtpExpiredAt(null);
        setResendAvailableAt(null);
      }

      setLoading(false);
      setLoadingMessage("Loading...");
    }, SMOOTH_LOADING_MS);
  };

  const handleLoginWithPassword = () => {
    setLoading(true);
    setLoadingMessage("Mengarahkan ke login...");
    setTimeout(() => router.push("/login"), SMOOTH_LOADING_MS);
  };

  const handlePasswordFormChange = (name, value) => {
    const sanitizedValue = removeSpaces(value);
    const nextForm = {
      ...passwordForm,
      [name]: sanitizedValue,
    };

    setPasswordForm(nextForm);
    persistActiveOtpSession({ passwordForm: nextForm });
  };

  const passwordAdornment = (visible, onClick, label) => (
    <InputAdornment position="end">
      <IconButton aria-label={label} onClick={onClick} edge="end">
        <Icon
          icon={
            visible ? "line-md:watch-twotone-loop" : "line-md:watch-off-loop"
          }
          style={{ color: theme.palette.primary.main }}
          fontSize={25}
        />
      </IconButton>
    </InputAdornment>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        px: 2,
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          py: { xs: 3, md: 5 },
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: "100%",
            maxWidth: 720,
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid rgba(0,0,0,0.10)",
            boxShadow: "0 18px 42px rgba(15, 23, 42, 0.12)",
            bgcolor: "background.default",
          }}
        >
          <AuthPageHeader
            badge="Pemulihan Akun"
            title="Reset Password"
            description="Cari akun Anda, pastikan identitas akun benar, lalu verifikasi kode OTP WhatsApp untuk membuat password baru."
            showLogoOnMobile={false}
          />

          <Stack spacing={2.2} sx={{ p: { xs: 2.4, md: 3 } }}>
            {!account && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  border: "1px solid rgba(15,23,42,0.10)",
                  bgcolor: "#fff",
                }}
              >
                <Stack spacing={1.5}>
                  <FontStyle sx={{ fontSize: 15, fontWeight: 800 }}>
                    Temukan akun
                  </FontStyle>
                  <ToggleButtonGroup
                    exclusive
                    fullWidth
                    value={lookupMethod}
                    onChange={handleLookupMethodChange}
                    sx={{
                      gap: 1,
                      "& .MuiToggleButton-root": {
                        flex: 1,
                        border: "1px solid rgba(0,0,0,0.12) !important",
                        borderRadius: "10px !important",
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 800,
                        fontSize: 12,
                        textTransform: "none",
                        py: 0.8,
                        color: "rgba(35,35,35,0.62)",
                        "&.Mui-selected": {
                          color: theme.palette.primary.main,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          borderColor: `${alpha(
                            theme.palette.primary.main,
                            0.28,
                          )} !important`,
                        },
                      },
                    }}
                  >
                    <ToggleButton value="account">
                      Username / Email
                    </ToggleButton>
                    <ToggleButton value="phone">Nomor WhatsApp</ToggleButton>
                  </ToggleButtonGroup>

                  {lookupMethod === "phone" ? (
                    <TextField
                      label="Nomor WhatsApp"
                      placeholder="82187xxxxxx"
                      variant="filled"
                      fullWidth
                      value={phoneIdentifier}
                      onChange={handlePhoneIdentifierChange}
                      disabled={loading}
                      autoFocus
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {phonePrefixAdornment}
                          </InputAdornment>
                        ),
                      }}
                    />
                  ) : (
                    <TextField
                      label="Username atau email"
                      placeholder="Contoh: userpm atau user@email.com"
                      variant="filled"
                      fullWidth
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      disabled={loading}
                      autoFocus
                    />
                  )}
                  <Button
                    variant="contained"
                    onClick={handleLookupAccount}
                    disabled={loading}
                    sx={{
                      py: 1.1,
                      fontWeight: 800,
                      textTransform: "none",
                      borderRadius: 1.5,
                    }}
                  >
                    Cari akun
                  </Button>
                </Stack>
              </Paper>
            )}

            {account && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1.4} alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: theme.palette.primary.main,
                        color: "#fff",
                      }}
                    >
                      <Icon icon="mdi:account-check" fontSize={26} />
                    </Box>
                    <Box minWidth={0}>
                      <FontStyle sx={{ fontSize: 18, fontWeight: 900 }}>
                        {account.full_name}
                      </FontStyle>
                      <FontStyle
                        sx={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "rgba(35,35,35,0.58)",
                        }}
                      >
                        @{account.username} - {account.email}
                      </FontStyle>
                    </Box>
                  </Stack>

                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "#fff",
                      border: "1px solid rgba(15,23,42,0.08)",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Icon icon="mdi:whatsapp" fontSize={22} color="#16A34A" />
                    <FontStyle sx={{ fontSize: 13, fontWeight: 600 }}>
                      OTP akan dikirim ke {account.phone_number}
                    </FontStyle>
                  </Box>

                  {hasActiveOtp && (
                    <Box
                      sx={{
                        p: 1.4,
                        borderRadius: 2,
                        border: "1px solid rgba(14,165,233,0.24)",
                        bgcolor: "rgba(14,165,233,0.08)",
                        display: "flex",
                        alignItems: { xs: "flex-start", sm: "center" },
                        gap: 1,
                      }}
                    >
                      <Box>
                        <FontStyle
                          sx={{
                            fontSize: 12.5,
                            fontWeight: 900,
                            color: "#0284C7",
                            letterSpacing: 0,
                          }}
                        >
                          OTP aktif selama {otpCountdownLabel}
                        </FontStyle>
                        <FontStyle
                          sx={{
                            mt: 0.2,
                            fontSize: 11.5,
                            fontWeight: 700,
                            color: "rgba(35,35,35,0.58)",
                            lineHeight: 1.5,
                          }}
                        >
                          Gunakan kode yang sudah dikirim ke WhatsApp untuk akun
                          ini.
                        </FontStyle>
                      </Box>
                    </Box>
                  )}

                  <Stack spacing={1.5}>
                    <TextField
                      label="Password baru"
                      variant="filled"
                      fullWidth
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      inputProps={{
                        maxLength: 72,
                      }}
                      onChange={(e) =>
                        handlePasswordFormChange("newPassword", e.target.value)
                      }
                      InputProps={{
                        endAdornment: passwordAdornment(
                          showNewPassword,
                          () => setShowNewPassword((current) => !current),
                          "toggle new password visibility",
                        ),
                      }}
                    />
                    <TextField
                      label="Konfirmasi password baru"
                      variant="filled"
                      fullWidth
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      inputProps={{
                        maxLength: 72,
                      }}
                      onChange={(e) =>
                        handlePasswordFormChange(
                          "confirmPassword",
                          e.target.value,
                        )
                      }
                      InputProps={{
                        endAdornment: passwordAdornment(
                          showConfirmPassword,
                          () => setShowConfirmPassword((current) => !current),
                          "toggle confirm password visibility",
                        ),
                      }}
                    />
                  </Stack>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.2}
                    alignItems="stretch"
                  >
                    <Button
                      variant="contained"
                      onClick={requestResetOtp}
                      disabled={loading}
                      sx={{
                        flex: 1,
                        py: 1.1,
                        fontWeight: 700,
                        textTransform: "none",
                        borderRadius: 1.5,
                      }}
                    >
                      Kirim OTP dan reset password
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleUseDifferentAccount}
                      disabled={loading}
                      sx={{
                        py: 1.1,
                        fontWeight: 700,
                        textTransform: "none",
                        borderRadius: 1.5,
                      }}
                    >
                      Bukan akun ini?
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            )}

            <Stack justifyContent="center" alignItems="center">
              <Button
                variant="text"
                onClick={handleLoginWithPassword}
                sx={{ fontWeight: 800, textTransform: "none" }}
              >
                Login dengan password
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>

      <Footer />

      <OTPVerificationModal
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        otpCode={otpCode}
        setOtpCode={setOtpCode}
        onSubmit={handleResetPassword}
        onResend={requestResetOtp}
        expiredAt={otpExpiredAt}
        resendAvailableAt={resendAvailableAt}
        loading={loading}
        otpLength={6}
        title="Verifikasi Reset Password"
        description="Masukkan kode OTP yang dikirim ke nomor WhatsApp akun Anda untuk menyimpan password baru."
        phoneNumber={account?.phone_number || ""}
        secondaryActionLabel="Login dengan password"
        secondaryActionIcon="mdi:login-variant"
        onSecondaryAction={handleLoginWithPassword}
      />

      <Notification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      />

      <LoadingBackdrop open={loading} message={loadingMessage} />
    </Box>
  );
};

export default ForgotPasswordPage;
