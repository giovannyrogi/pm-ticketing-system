import FontStyle from "@/app/components/font-style/FontStyle";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import { Box, Chip, Paper, Stack } from "@mui/material";
import { PUBLIC_GREEN } from "./publicPageConstants";

const PublicHero = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        position: "relative",
        overflow: "hidden",
        mt: { xs: 1, md: 2 },
        mb: 2,
        px: { xs: 2, md: 3 },
        py: { xs: 3, md: 4 },
        borderRadius: 2,
        border: "1px solid rgba(0,0,0,0.10)",
        background:
          "linear-gradient(135deg, rgba(22,163,74,0.09) 0%, rgba(255,255,255,1) 42%, rgba(230,9,9,0.08) 100%)",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
      >
        <Box sx={{ maxWidth: 720 }}>
          <Chip
            icon={<VerifiedOutlinedIcon sx={{ fontSize: 16 }} />}
            label="Laporan selesai dan terpublikasi"
            sx={{
              mb: 1.5,
              height: 30,
              borderRadius: 2,
              bgcolor: "rgba(22, 163, 74, 0.10)",
              color: PUBLIC_GREEN,
              border: "1px solid rgba(22, 163, 74, 0.22)",
              fontFamily: "Poppins, sans-serif",
              fontWeight: 700,
              fontSize: 12,
              "& .MuiChip-icon": {
                color: PUBLIC_GREEN,
              },
            }}
          />

          <FontStyle
            sx={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 800,
              fontSize: { xs: 24, md: 32 },
              lineHeight: 1.2,
              color: "text.primary",
              letterSpacing: 0,
            }}
          >
            PMCare, ruang transparansi laporan masyarakat
          </FontStyle>

          <FontStyle
            sx={{
              mt: 1.2,
              maxWidth: 680,
              fontFamily: "Poppins, sans-serif",
              fontSize: { xs: 13, md: 14 },
              lineHeight: 1.8,
              color: "rgba(35,35,35,0.66)",
              letterSpacing: 0,
              fontWeight: 600,
            }}
          >
            Jelajahi laporan yang telah selesai ditangani oleh admin PMCare.
            Gunakan pencarian dan filter untuk menemukan informasi layanan,
            lokasi, atau kategori laporan yang paling relevan.
          </FontStyle>
        </Box>
      </Stack>
    </Paper>
  );
};

export default PublicHero;
