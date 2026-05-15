import FontStyle from "@/app/components/font-style/FontStyle";
import { Box, Paper } from "@mui/material";
import { iconBoxSx } from "./publicPageStyles";

const PublicSummaryCard = ({
  title,
  value,
  helper,
  icon,
  color,
  tone,
  background,
}) => {
  return (
    <Paper
      elevation={2}
      sx={{
        height: "100%",
        minHeight: 146,
        p: { xs: 1.5, md: 2 },
        borderRadius: 2.5,
        border: "1px solid rgba(0,0,0,0.10)",
        background,
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 1.2,
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          right: -28,
          bottom: -34,
          width: 108,
          height: 108,
          borderRadius: "50%",
          bgcolor: tone,
          opacity: 0.55,
        }}
      />

      <Box display="flex" justifyContent="space-between" gap={2} zIndex={1}>
        <Box minWidth={0}>
          <FontStyle
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: "rgba(35,35,35,0.64)",
              letterSpacing: 0,
            }}
          >
            {title}
          </FontStyle>

          <FontStyle
            sx={{
              mt: 0.8,
              fontSize: { xs: 26, md: 28 },
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: 0,
              color: "#111827",
            }}
          >
            {value}
          </FontStyle>
        </Box>

        <Box sx={iconBoxSx(color, tone)}>{icon}</Box>
      </Box>

      <Box zIndex={1}>
        <FontStyle
          sx={{
            fontSize: 12,
            fontWeight: 700,
            color: "rgba(35,35,35,0.56)",
            letterSpacing: 0,
            lineHeight: 1.45,
          }}
        >
          {helper}
        </FontStyle>
      </Box>
    </Paper>
  );
};

export default PublicSummaryCard;
