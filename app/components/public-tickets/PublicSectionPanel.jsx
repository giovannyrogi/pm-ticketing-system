import FontStyle from "@/app/components/font-style/FontStyle";
import { Box, Paper, Stack } from "@mui/material";
import { iconBoxSx } from "./publicPageStyles";

const PublicSectionPanel = ({
  title,
  subtitle,
  icon,
  iconColor,
  iconTone,
  action,
  children,
}) => {
  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 2.5,
        border: "1px solid rgba(0,0,0,0.10)",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={1.5}
        sx={{
          p: { xs: 1.5, md: 2 },
          background:
            "linear-gradient(135deg, rgba(250,250,250,1) 0%, rgba(255,255,255,1) 72%)",
        }}
      >
        <Stack direction="row" spacing={1.3} alignItems="center">
          <Box sx={iconBoxSx(iconColor, iconTone)}>{icon}</Box>
          <Box>
            <FontStyle
              sx={{
                fontSize: { xs: 15, md: 16 },
                fontWeight: 600,
                color: iconColor,
                letterSpacing: 0,
                lineHeight: 1.2,
              }}
            >
              {title}
            </FontStyle>
            <FontStyle
              sx={{
                mt: 0.3,
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(35,35,35,0.58)",
                letterSpacing: 0,
              }}
            >
              {subtitle}
            </FontStyle>
          </Box>
        </Stack>

        {action}
      </Stack>

      <Box sx={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>{children}</Box>
    </Paper>
  );
};

export default PublicSectionPanel;
