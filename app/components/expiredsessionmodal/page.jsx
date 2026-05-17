"use client";

import AppModal from "@/app/components/modal/AppModal";
import FontStyle from "@/app/components/font-style/FontStyle";
import { Icon } from "@iconify/react";
import { Box, LinearProgress, Stack, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";

const SESSION_MODAL_COUNTDOWN = 10;

const ExpiredSessionModal = ({ open, onClose, counter = 0 }) => {
  const theme = useTheme();
  const progressValue =
    SESSION_MODAL_COUNTDOWN > 0
      ? Math.max(0, Math.min(100, (counter / SESSION_MODAL_COUNTDOWN) * 100))
      : 0;

  return (
    <AppModal
      open={open}
      title="Sesi Login Berakhir"
      description="Untuk menjaga keamanan akun, Anda perlu login kembali sebelum melanjutkan."
      icon="solar:shield-warning-bold-duotone"
      iconColor={theme.palette.primary.main}
      submitText="Kembali ke Login"
      hideCancel
      onClose={undefined}
      onSubmit={onClose}
      maxWidth={500}
      bodySx={{
        gridTemplateColumns: "1fr",
        gap: 1.6,
      }}
    >
      <Box
        sx={{
          gridColumn: "1 / -1",
          p: { xs: 1.6, sm: 1.8 },
          borderRadius: 2.2,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
          bgcolor: alpha(theme.palette.primary.main, 0.035),
        }}
      >
        <Stack spacing={1.4} alignItems="center" textAlign="center">
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              color: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
            }}
          >
            <Icon icon="line-md:logout" fontSize={36} />
          </Box>

          <Box>
            <FontStyle
              sx={{
                fontSize: { xs: 15, sm: 16 },
                fontWeight: 700,
                color: "text.primary",
                lineHeight: 1.45,
              }}
            >
              Anda akan diarahkan otomatis dalam {counter} detik
            </FontStyle>
            <FontStyle
              sx={{
                mt: 0.6,
                fontSize: { xs: 12, sm: 12.5 },
                fontWeight: 600,
                color: "rgba(35,35,35,0.62)",
                lineHeight: 1.7,
              }}
            >
              Untuk menjaga keamanan akun, silakan login kembali untuk membuka
              akses sesuai peran akun Anda.
            </FontStyle>
          </Box>

          <Box sx={{ width: "100%", pt: 0.4 }}>
            <LinearProgress
              variant="determinate"
              value={progressValue}
              sx={{
                height: 8,
                borderRadius: 999,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                  bgcolor: theme.palette.primary.main,
                  transition: "transform 900ms linear",
                },
              }}
            />
          </Box>
        </Stack>
      </Box>
    </AppModal>
  );
};

export default ExpiredSessionModal;
