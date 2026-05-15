import FontStyle from "@/app/components/font-style/FontStyle";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { Box, Paper, Stack } from "@mui/material";
import { alpha } from "@mui/material/styles";

const PublicTicketsEmptyState = ({ color }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 5 },
        minHeight: 220,
        border: "1px dashed rgba(230,9,9,0.28)",
        borderRadius: 2.5,
        textAlign: "center",
        bgcolor: alpha(color, 0.03),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack spacing={1.4} alignItems="center" maxWidth={460}>
        <Box
          sx={{
            width: 58,
            height: 58,
            borderRadius: 3,
            display: "grid",
            placeItems: "center",
            color,
            bgcolor: alpha(color, 0.1),
          }}
        >
          <ReportProblemOutlinedIcon sx={{ fontSize: 30 }} />
        </Box>

        <Box>
          <FontStyle
            sx={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 900,
              fontSize: { xs: 17, md: 19 },
              color: "text.primary",
              letterSpacing: 0,
            }}
          >
            Belum ada laporan yang cocok
          </FontStyle>
          <FontStyle
            sx={{
              mt: 0.75,
              fontFamily: "Poppins, sans-serif",
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(35,35,35,0.58)",
              lineHeight: 1.7,
              letterSpacing: 0,
            }}
          >
            Coba ubah kata kunci, pilih semua kategori, atau kembalikan filter
            lokasi ke semua lokasi.
          </FontStyle>
        </Box>
      </Stack>
    </Paper>
  );
};

export default PublicTicketsEmptyState;
