"use client";

import FontStyle from "@/app/components/font-style/FontStyle";
import { Icon } from "@iconify/react";
import { Box, Chip, Paper, Stack } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

const TicketListHeader = () => {
  const theme = useTheme();

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, md: 2.4 },
        borderRadius: 2.5,
        border: "1px solid rgba(0,0,0,0.10)",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        background:
          "linear-gradient(135deg, rgba(230,9,9,0.08) 0%, rgba(255,255,255,1) 52%, rgba(37,99,235,0.08) 100%)",
        overflow: "hidden",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.8}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
      >
        <Box>
          <Chip
            label="Pusat Tiket"
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
              fontWeight: 700,
              color: "text.primary",
              letterSpacing: 0,
              lineHeight: 1.12,
            }}
          >
            Daftar Tiket
          </FontStyle>
          <FontStyle
            sx={{
              mt: 0.6,
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(35,35,35,0.62)",
              letterSpacing: 0,
              lineHeight: 1.65,
              maxWidth: 760,
            }}
          >
            Pantau antrean, status penanganan, dan riwayat laporan dalam satu
            tampilan yang mudah dipindai.
          </FontStyle>
        </Box>

        <Box
          sx={{
            width: { xs: 52, md: 72 },
            height: { xs: 52, md: 72 },
            borderRadius: "50%",
            bgcolor: alpha("#2563EB", 0.09),
            color: "#2563EB",
            border: "1px solid rgba(37,99,235,0.14)",
            display: { xs: "none", sm: "grid" },
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <Icon icon="mdi:clipboard-text-search-outline" fontSize={34} />
        </Box>
      </Stack>
    </Paper>
  );
};

export default TicketListHeader;
