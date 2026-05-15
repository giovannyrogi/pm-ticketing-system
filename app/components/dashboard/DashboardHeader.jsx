import FontStyle from "@/app/components/font-style/FontStyle";
import { Box, Chip, Paper, Stack } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Icon } from "@iconify/react";

const DashboardHeader = ({ countdownMinutes, countdownSeconds }) => {
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
          "linear-gradient(135deg, rgba(230,9,9,0.08) 0%, rgba(255,255,255,1) 50%, rgba(37,99,235,0.08) 100%)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.8}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box>
            <Chip
              label="Pusat Monitoring"
              size="small"
              sx={{
                height: 24,
                mb: 1,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.09),
                color: theme.palette.primary.main,
                fontFamily: "Poppins, sans-serif",
                fontWeight: 600,
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
              Dashboard Monitoring
            </FontStyle>

            <FontStyle
              sx={{
                mt: 0.6,
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(35,35,35,0.62)",
                letterSpacing: 0,
                lineHeight: 1.65,
                maxWidth: 780,
              }}
            >
              Pantau antrean laporan, performa penanganan, dan publikasi tiket
              secara ringkas.
            </FontStyle>
          </Box>
        </Stack>

        <Chip
          icon={<Icon icon="mdi:timer-sync-outline" fontSize={17} />}
          label={`Refresh otomatis ${countdownMinutes}:${countdownSeconds}`}
          sx={{
            height: 34,
            borderRadius: 2,
            alignSelf: { xs: "stretch", sm: "flex-start", md: "center" },
            justifyContent: { xs: "center", sm: "flex-start" },
            bgcolor: "rgba(230, 9, 9, 0.08)",
            color: theme.palette.primary.main,
            border: "1px solid rgba(230, 9, 9, 0.22)",
            fontFamily: "Poppins, sans-serif",
            fontWeight: 600,
            fontSize: 12,
            "& .MuiChip-icon": {
              color: theme.palette.primary.main,
              ml: 1,
            },
          }}
        />
      </Stack>
    </Paper>
  );
};

export default DashboardHeader;
