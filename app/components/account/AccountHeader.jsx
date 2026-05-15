import FontStyle from "@/app/components/font-style/FontStyle";
import { Box, Chip, Paper, Stack } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Icon } from "@iconify/react";

const AccountHeader = () => {
  const theme = useTheme();

  return (
    <Paper
      elevation={2}
      sx={{
        mb: 2.5,
        p: { xs: 2, md: 2.4 },
        borderRadius: 2.5,
        border: "1px solid rgba(0,0,0,0.10)",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        background:
          "linear-gradient(135deg, rgba(230,9,9,0.08) 0%, rgba(255,255,255,1) 52%, rgba(37,99,235,0.08) 100%)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          right: -34,
          top: -40,
          width: 132,
          height: 132,
          borderRadius: "50%",
          bgcolor: alpha(theme.palette.primary.main, 0.08),
        }}
      />

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.8}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        position="relative"
        zIndex={1}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box>
            <Chip
              label="Pusat Akun"
              size="small"
              sx={{
                height: 24,
                mb: 1,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.09),
                color: theme.palette.primary.main,
                fontFamily: "Poppins, sans-serif",
                fontWeight: 700,
                fontSize: 11,
              }}
            />

            <FontStyle
              sx={{
                fontSize: { xs: 22, md: 24 },
                fontWeight: 800,
                color: "text.primary",
                letterSpacing: 0,
                lineHeight: 1.12,
              }}
            >
              Profil Akun
            </FontStyle>

            <FontStyle
              sx={{
                mt: 0.6,
                fontSize: { xs: 12.5, md: 13 },
                fontWeight: 600,
                color: "rgba(35,35,35,0.62)",
                letterSpacing: 0,
                lineHeight: 1.65,
                maxWidth: 760,
              }}
            >
              Kelola keamanan akun, email, dan nomor WhatsApp yang digunakan di
              PMCare.
            </FontStyle>
          </Box>
        </Stack>

        <Chip
          icon={<Icon icon="mdi:shield-check-outline" fontSize={17} />}
          label="Perubahan sensitif wajib verifikasi"
          sx={{
            height: 34,
            borderRadius: 2,
            bgcolor: "rgba(22,163,74,0.10)",
            color: "#16A34A",
            border: "1px solid rgba(22,163,74,0.18)",
            fontFamily: "Poppins, sans-serif",
            fontWeight: 800,
            fontSize: 12,
            "& .MuiChip-icon": {
              color: "#16A34A",
            },
          }}
        />
      </Stack>
    </Paper>
  );
};

export default AccountHeader;
