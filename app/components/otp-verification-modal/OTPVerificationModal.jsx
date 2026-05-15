"use client";

import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  CircularProgress,
  Fade,
  Modal,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { Icon } from "@iconify/react";
import OtpInput from "react-otp-input";
import FontStyle from "../font-style/FontStyle";

const OTPVerificationModal = ({
  open,
  onClose,
  otpCode,
  setOtpCode,
  onSubmit,
  onResend,
  loading = false,

  expiredAt,

  resendAvailableAt,

  title = "Verifikasi OTP",

  description = "Masukkan kode OTP",

  phoneNumber = "",

  otpLength = 6,

  secondaryActionLabel = "",

  onSecondaryAction,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");

  const [remainingTime, setRemainingTime] = useState(null);

  const [resendTime, setResendTime] = useState(null);

  useEffect(() => {
    if (!open) return;

    const updateCountdown = () => {
      if (expiredAt) {
        const diff = Math.floor((new Date(expiredAt) - new Date()) / 1000);

        setRemainingTime(diff > 0 ? diff : 0);
      }

      if (resendAvailableAt) {
        const diff = Math.floor(
          (new Date(resendAvailableAt) - new Date()) / 1000,
        );

        setResendTime(diff > 0 ? diff : 0);
      }
    };

    /**
     * =========================
     * INITIAL CALL
     * =========================
     */
    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [open, expiredAt, resendAvailableAt]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);

    const sec = seconds % 60;

    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const style = {
    position: "absolute",

    top: "50%",
    left: "50%",

    transform: "translate(-50%, -50%)",

    width: isMobile ? "92vw" : 440,

    maxWidth: "95vw",

    border: "1px solid rgba(0,0,0,0.04)",

    backdropFilter: "blur(10px)",

    bgcolor: "background.paper",

    borderRadius: 4,

    p: isMobile ? 3 : 4,

    outline: "none",
    boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
  };

  return (
    <Modal open={open} onClose={loading ? null : onClose} closeAfterTransition>
      <Fade in={open}>
        <Box sx={style}>
          <Box
            sx={{
              width: 84,
              height: 84,

              borderRadius: "50%",

              background:
                "linear-gradient(135deg, rgba(255,0,0,.12), rgba(255,0,0,.04))",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              margin: "0 auto",

              mb: 2.5,

              border: "1px solid rgba(255, 0, 0, 0.3)",
            }}
          >
            <Icon
              icon="solar:shield-keyhole-bold"
              width={60}
              style={{
                color: theme.palette.primary.main,
              }}
            />
          </Box>
          <FontStyle
            sx={{
              fontSize: 18,
              fontWeight: 600,
              fontFamily: "Poppins",
              mb: 1,
              textAlign: "center",
              color: theme.palette.primary.main,
            }}
          >
            {title}
          </FontStyle>

          <FontStyle
            sx={{
              fontSize: 13,
              color: "text.disabled",
              fontFamily: "Poppins",
              mb: 2,
              mt: 2,
              lineHeight: 1.7,
              textAlign: "center",
              fontWeight: "500",
            }}
          >
            {description}
          </FontStyle>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              gap: 1,

              width: "fit-content",

              margin: "0 auto",

              mb: 2.5,

              px: 2,
              py: 1.2,

              borderRadius: 999,

              background: `${theme.palette.success.main}10`,

              border: `1px solid ${theme.palette.success.main}25`,
            }}
          >
            <Icon icon="logos:whatsapp-icon" width={22} />

            <FontStyle
              sx={{
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "Poppins",
                color: "#51c862",
                letterSpacing: 0.5,
              }}
            >
              {phoneNumber}
            </FontStyle>
          </Box>

          <FontStyle
            sx={{
              fontSize: 13,
              color: "text.disabled",
              textAlign: "center",
              lineHeight: 1.7,
              mb: 3,
              fontWeight: "500",
              fontFamily: "Poppins",
            }}
          >
            Demi keamanan akun, jangan bagikan kode OTP kepada siapa pun,
            termasuk pihak PMCare.
          </FontStyle>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",

              gap: 1.2,

              mb: secondaryActionLabel && onSecondaryAction ? 3.2 : remainingTime > 0 ? 2.2 : 3.5,
            }}
          >
            {remainingTime > 0 && (
              <FontStyle
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "warning.main",
                  fontFamily: "Poppins",

                  display: "flex",
                  alignItems: "center",
                  gap: 0.7,
                }}
              >
                <Icon icon="solar:clock-circle-bold" width={16} />
                OTP berlaku selama {formatTime(remainingTime)}
              </FontStyle>
            )}

            {resendTime > 0 ? (
              <FontStyle
                sx={{
                  fontSize: 13,
                  color: "text.secondary",
                  fontFamily: "Poppins",

                  display: "flex",
                  alignItems: "center",
                  gap: 0.7,
                }}
              >
                <Icon icon="solar:refresh-circle-bold" width={16} />
                Kirim ulang dalam {formatTime(resendTime)}
              </FontStyle>
            ) : (
              <Box
                onClick={loading ? undefined : onResend}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,

                  cursor: "pointer",

                  background: "rgba(255,0,0,.06)",

                  color: "primary.main",

                  px: 2,
                  py: 1,

                  borderRadius: 999,

                  transition: "all .2s ease",

                  "&:hover": {
                    background: "rgba(255,0,0,.12)",
                  },
                }}
              >
                <Icon icon="solar:refresh-bold" width={16} />

                <FontStyle
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "Poppins",
                  }}
                >
                  Kirim Ulang OTP
                </FontStyle>
              </Box>
            )}

            {secondaryActionLabel && onSecondaryAction && (
              <Box
                onClick={loading ? undefined : onSecondaryAction}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  cursor: loading ? "not-allowed" : "pointer",
                  background: "rgba(230,9,9,.08)",
                  border: `1px solid ${theme.palette.primary.main}30`,
                  color: theme.palette.primary.main,
                  px: 2.2,
                  py: 0.9,
                  borderRadius: 999,
                  transition: "all .2s ease",
                  boxShadow: "0 6px 16px rgba(230,9,9,.08)",
                  "&:hover": {
                    background: "rgba(230,9,9,.13)",
                    borderColor: `${theme.palette.primary.main}55`,
                  },
                }}
              >
                <Icon icon="solar:pen-bold" width={15} />

                <FontStyle
                  sx={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    fontFamily: "Poppins",
                    color: "inherit",
                  }}
                >
                  {secondaryActionLabel}
                </FontStyle>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 4.5,
            }}
          >
            <OtpInput
              value={otpCode}
              onChange={setOtpCode}
              numInputs={otpLength}
              shouldAutoFocus
              inputType="tel"
              containerStyle={{
                justifyContent: "center",
                gap: isMobile ? 8 : 12,
              }}
              renderInput={(props) => (
                <input
                  {...props}
                  onFocus={(e) => {
                    e.target.style.border = `1.5px solid ${theme.palette.primary.main}`;

                    e.target.style.boxShadow = `0 0 0 4px ${theme.palette.primary.main}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.border = `1.5px solid ${theme.palette.divider}`;

                    e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,.05)";
                  }}
                  style={{
                    width: isMobile ? 44 : 56,

                    height: isMobile ? 52 : 62,

                    borderRadius: 16,

                    border: `1.5px solid ${theme.palette.divider}`,

                    fontSize: isMobile ? 22 : 24,

                    fontWeight: 700,

                    textAlign: "center",

                    outline: "none",

                    fontFamily: "Poppins",

                    transition: "all .2s ease",

                    background: "#fff",

                    boxShadow: "0 4px 12px rgba(0,0,0,.05)",

                    appearance: "none",

                    WebkitAppearance: "none",

                    MozAppearance: "textfield",

                    caretColor: "#ef4444",

                    boxSizing: "border-box",
                  }}
                />
              )}
            />
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="medium"
            onClick={onSubmit}
            disabled={loading || otpCode.length !== otpLength}
            sx={{
              fontWeight: 600,
              fontSize: 16,
              textTransform: "none",
              borderRadius: 3,

              boxShadow: "0 10px 24px rgba(255,0,0,.18)",

              transition: "all .2s ease",

              "&:hover": {
                transform: "translateY(-1px)",
              },
            }}
          >
            {loading ? "Loading..." : "Verifikasi OTP"}
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
};

export default OTPVerificationModal;
