"use client";

import AccountActionCard from "@/app/components/account/AccountActionCard";
import AccountFormModal from "@/app/components/account/AccountFormModal";
import AccountHeader from "@/app/components/account/AccountHeader";
import AccountInfoCard from "@/app/components/account/AccountInfoCard";
import LoadingBackdrop from "@/app/components/loading/Backdrop";
import Notification from "@/app/components/notification/Notification";
import OTPVerificationModal from "@/app/components/otp-verification-modal/OTPVerificationModal";
import {
  clearAccountPhoneOTPSession,
  getAccountPhoneOTPSession,
  saveAccountPhoneOTPSession,
} from "@/app/utils/accountPhoneOtpSession";
import { updateUserCookie } from "@/app/utils/updateUserCookie";
import {
  sanitizePhoneNumber,
  validateEmail,
  validatePhoneNumber,
} from "@/app/utils/validationTextField";
import { Box, Grid, Stack, Typography } from "@mui/material";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

const EMPTY_PASSWORD_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const EMPTY_EMAIL_FORM = {
  email: "",
  currentPassword: "",
};

const EMPTY_PHONE_FORM = {
  phoneNumber: "",
  currentPassword: "",
};

const PASSWORD_ACTION_COLOR = "#2563EB";
const EMAIL_ACTION_COLOR = "#B7791F";
const PHONE_ACTION_COLOR = "#16A34A";
const PASSWORD_ACTION_TONE = "rgba(37, 99, 235, 0.12)";
const EMAIL_ACTION_TONE = "rgba(245, 158, 11, 0.14)";
const PHONE_ACTION_TONE = "rgba(22, 163, 74, 0.12)";

const AccountPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpExpiredAt, setOtpExpiredAt] = useState(null);
  const [resendAvailableAt, setResendAvailableAt] = useState(null);
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [emailForm, setEmailForm] = useState(EMPTY_EMAIL_FORM);
  const [phoneForm, setPhoneForm] = useState(EMPTY_PHONE_FORM);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showMessage = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/account/profile");

      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      showMessage(
        err?.response?.data?.message || "Gagal mengambil data profil",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  useEffect(() => {
    const otpSession = getAccountPhoneOTPSession();

    if (!otpSession) return;

    if (new Date() > new Date(otpSession.expiredAt)) {
      clearAccountPhoneOTPSession();
      return;
    }

    setPhoneForm({
      phoneNumber: otpSession.phoneNumber || "",
      currentPassword: otpSession.currentPassword || "",
    });
    setOtpExpiredAt(otpSession.expiredAt);
    setResendAvailableAt(otpSession.resendAvailableAt);
    setOtpOpen(true);
  }, []);

  const handlePasswordChange = (name, value) => {
    setPasswordForm((current) => ({ ...current, [name]: value }));
  };

  const handleEmailChange = (name, value) => {
    setEmailForm((current) => ({ ...current, [name]: value }));
  };

  const handlePhoneChange = (name, value) => {
    const nextValue = name === "phoneNumber" ? sanitizePhoneNumber(value) : value;

    setPhoneForm((current) => ({ ...current, [name]: nextValue }));
  };

  const handleUpdatePassword = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      showMessage("Semua field password harus diisi", "error");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      showMessage("Password baru minimal 8 karakter", "error");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage("Konfirmasi password baru tidak sesuai", "error");
      return;
    }

    try {
      setSubmitting(true);
      setProcessingMessage("Memperbarui password...");
      const res = await axios.patch("/api/account/password", passwordForm);

      if (res.data.success) {
        setPasswordOpen(false);
        setPasswordForm(EMPTY_PASSWORD_FORM);
        showMessage(res.data.message || "Password berhasil diperbarui");
      }
    } catch (err) {
      showMessage(
        err?.response?.data?.message || "Gagal memperbarui password",
        "error",
      );
    } finally {
      setSubmitting(false);
      setProcessingMessage("");
    }
  };

  const handleUpdateEmail = async () => {
    const emailError = validateEmail(emailForm.email?.trim());

    if (!emailForm.email || !emailForm.currentPassword) {
      showMessage("Email dan password saat ini harus diisi", "error");
      return;
    }

    if (emailError) {
      showMessage(emailError, "error");
      return;
    }

    try {
      setSubmitting(true);
      setProcessingMessage("Memperbarui email...");
      const res = await axios.patch("/api/account/email", emailForm);

      if (res.data.success) {
        setProfile(res.data.data);
        updateUserCookie(res.data.data);
        setEmailOpen(false);
        setEmailForm(EMPTY_EMAIL_FORM);
        showMessage(res.data.message || "Email berhasil diperbarui");
      }
    } catch (err) {
      showMessage(
        err?.response?.data?.message || "Gagal memperbarui email",
        "error",
      );
    } finally {
      setSubmitting(false);
      setProcessingMessage("");
    }
  };

  const requestPhoneOtp = async () => {
    const phoneError = validatePhoneNumber(phoneForm.phoneNumber);

    if (!phoneForm.phoneNumber || !phoneForm.currentPassword) {
      showMessage("Nomor telepon dan password saat ini harus diisi", "error");
      return;
    }

    if (phoneError) {
      showMessage(phoneError, "error");
      return;
    }

    try {
      setSubmitting(true);
      setProcessingMessage("Mengirim kode OTP...");
      const res = await axios.post("/api/account/phone/send-otp", phoneForm);

      if (res.data.success) {
        setOtpExpiredAt(res.data.expiredAt);
        setResendAvailableAt(res.data.resendAvailableAt);
        saveAccountPhoneOTPSession({
          phoneNumber: phoneForm.phoneNumber,
          currentPassword: phoneForm.currentPassword,
          expiredAt: res.data.expiredAt,
          resendAvailableAt: res.data.resendAvailableAt,
        });
        setOtpCode("");
        setPhoneOpen(false);
        setOtpOpen(true);
        showMessage("Kode OTP berhasil dikirim ke WhatsApp");
      }
    } catch (err) {
      const data = err?.response?.data;

      if (data?.expiredAt) {
        setOtpExpiredAt(data.expiredAt);
        setResendAvailableAt(data.resendAvailableAt);
        saveAccountPhoneOTPSession({
          phoneNumber: phoneForm.phoneNumber,
          currentPassword: phoneForm.currentPassword,
          expiredAt: data.expiredAt,
          resendAvailableAt: data.resendAvailableAt,
        });
        setOtpOpen(true);
      }

      showMessage(data?.message || "Gagal mengirim OTP", "error");
    } finally {
      setSubmitting(false);
      setProcessingMessage("");
    }
  };

  const verifyPhoneOtp = async () => {
    if (otpCode.length !== 6) {
      showMessage("Kode OTP harus 6 digit", "error");
      return;
    }

    try {
      setSubmitting(true);
      setProcessingMessage("Memverifikasi kode OTP...");
      const res = await axios.post("/api/account/phone/verify-otp", {
        phoneNumber: phoneForm.phoneNumber,
        otpCode,
      });

      if (res.data.success) {
        setProfile(res.data.data);
        updateUserCookie(res.data.data);
        setOtpOpen(false);
        setOtpCode("");
        setPhoneForm(EMPTY_PHONE_FORM);
        clearAccountPhoneOTPSession();
        showMessage(res.data.message || "Nomor telepon berhasil diperbarui");
      }
    } catch (err) {
      showMessage(
        err?.response?.data?.message || "Verifikasi OTP gagal",
        "error",
      );
    } finally {
      setSubmitting(false);
      setProcessingMessage("");
    }
  };

  const handleEditPhoneFromOtp = () => {
    setOtpOpen(false);
    setOtpCode("");
    setPhoneOpen(true);
  };

  const handleOpenPhoneModal = () => {
    const otpSession = getAccountPhoneOTPSession();

    if (otpSession && new Date() <= new Date(otpSession.expiredAt)) {
      setPhoneForm({
        phoneNumber: otpSession.phoneNumber || "",
        currentPassword: otpSession.currentPassword || "",
      });
      setOtpExpiredAt(otpSession.expiredAt);
      setResendAvailableAt(otpSession.resendAvailableAt);
      setOtpOpen(true);
      return;
    }

    clearAccountPhoneOTPSession();
    setPhoneForm({
      phoneNumber: profile?.phone_number || "",
      currentPassword: "",
    });
    setPhoneOpen(true);
  };

  return (
    <Box sx={{ pb: 4 }}>
      <AccountHeader />

      <Stack spacing={2.5}>
        <AccountInfoCard profile={profile} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <AccountActionCard
              icon="mdi:lock-reset"
              title="Ganti Password"
              description="Gunakan password saat ini untuk memastikan perubahan dilakukan oleh pemilik akun."
              buttonLabel="Ganti password"
              color={PASSWORD_ACTION_COLOR}
              tone={PASSWORD_ACTION_TONE}
              onClick={() => setPasswordOpen(true)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <AccountActionCard
              icon="mdi:email-edit-outline"
              title="Ganti Email"
              description="Email dapat diperbarui setelah password saat ini berhasil diverifikasi."
              buttonLabel="Ganti email"
              color={EMAIL_ACTION_COLOR}
              tone={EMAIL_ACTION_TONE}
              onClick={() => {
                setEmailForm({
                  email: profile?.email || "",
                  currentPassword: "",
                });
                setEmailOpen(true);
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <AccountActionCard
              icon="mdi:whatsapp"
              title="Ganti Nomor Telepon"
              description="Nomor baru wajib diverifikasi dengan OTP WhatsApp sebelum disimpan."
              buttonLabel="Ganti nomor"
              color={PHONE_ACTION_COLOR}
              tone={PHONE_ACTION_TONE}
              onClick={handleOpenPhoneModal}
            />
          </Grid>
        </Grid>
      </Stack>

      <AccountFormModal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        title="Ganti Password"
        description="Masukkan password saat ini dan password baru untuk memperbarui kredensial akun."
        icon="mdi:lock-reset"
        values={passwordForm}
        onChange={handlePasswordChange}
        onSubmit={handleUpdatePassword}
        loading={submitting}
        submitLabel="Simpan password"
        color={PASSWORD_ACTION_COLOR}
        tone={PASSWORD_ACTION_TONE}
        fields={[
          {
            name: "currentPassword",
            label: "Password saat ini",
            type: "password",
            autoComplete: "current-password",
          },
          {
            name: "newPassword",
            label: "Password baru",
            type: "password",
            autoComplete: "new-password",
          },
          {
            name: "confirmPassword",
            label: "Konfirmasi password baru",
            type: "password",
            autoComplete: "new-password",
          },
        ]}
      />

      <AccountFormModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        title="Ganti Email"
        description="Email baru akan disimpan setelah password saat ini benar."
        icon="mdi:email-edit-outline"
        values={emailForm}
        onChange={handleEmailChange}
        onSubmit={handleUpdateEmail}
        loading={submitting}
        submitLabel="Simpan email"
        color={EMAIL_ACTION_COLOR}
        tone={EMAIL_ACTION_TONE}
        fields={[
          {
            name: "currentPassword",
            label: "Password saat ini",
            type: "password",
            autoComplete: "current-password",
          },
          {
            name: "email",
            label: "Email baru",
            type: "email",
            autoComplete: "email",
          },
        ]}
      />

      <AccountFormModal
        open={phoneOpen}
        onClose={() => setPhoneOpen(false)}
        title="Ganti Nomor Telepon"
        description="Masukkan nomor WhatsApp baru dan password saat ini. Kode OTP akan dikirim setelah password benar."
        icon="mdi:whatsapp"
        values={phoneForm}
        onChange={handlePhoneChange}
        onSubmit={requestPhoneOtp}
        loading={submitting}
        submitLabel="Kirim OTP"
        color={PHONE_ACTION_COLOR}
        tone={PHONE_ACTION_TONE}
        fields={[
          {
            name: "currentPassword",
            label: "Password saat ini",
            type: "password",
            autoComplete: "current-password",
          },
          {
            name: "phoneNumber",
            label: "Nomor WhatsApp baru",
            type: "tel",
            autoComplete: "tel",
            placeholder: "82187xxxxxx",
            startAdornment: (
              <Typography
                sx={{
                  fontFamily: "Poppins, sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "text.primary",
                }}
              >
                +62
              </Typography>
            ),
          },
        ]}
      />

      <OTPVerificationModal
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        otpCode={otpCode}
        setOtpCode={setOtpCode}
        onSubmit={verifyPhoneOtp}
        onResend={requestPhoneOtp}
        expiredAt={otpExpiredAt}
        resendAvailableAt={resendAvailableAt}
        loading={submitting}
        otpLength={6}
        title="Verifikasi Nomor WhatsApp"
        description="Masukkan kode OTP yang dikirim ke nomor WhatsApp baru untuk menyelesaikan perubahan nomor telepon."
        phoneNumber={`+62${phoneForm.phoneNumber}`}
        secondaryActionLabel="Ubah nomor WhatsApp"
        onSecondaryAction={handleEditPhoneFromOtp}
      />

      <LoadingBackdrop
        open={loading || submitting}
        message={loading ? "Memuat profil..." : processingMessage}
      />
      <Notification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      />
    </Box>
  );
};

export default AccountPage;
