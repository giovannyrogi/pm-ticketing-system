"use client";

import FontStyle from "@/app/components/font-style/FontStyle";
import { Box, Chip, Stack, useMediaQuery, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import Image from "next/image";

const AuthPageHeader = ({
  badge,
  title,
  description,
  showLogoOnMobile = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const showLogo = showLogoOnMobile || !isMobile;

  return (
    <Box
      sx={{
        p: { xs: 2.4, md: 3 },
        background:
          "linear-gradient(135deg, rgba(230,9,9,0.09) 0%, rgba(255,255,255,1) 52%, rgba(22,163,74,0.08) 100%)",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
      >
        <Box>
          <Chip
            label={badge}
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
              fontSize: { xs: 24, md: 30 },
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: 0,
              color: "#111827",
            }}
          >
            {title}
          </FontStyle>
          <FontStyle
            sx={{
              mt: 0.8,
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(35,35,35,0.62)",
              lineHeight: 1.65,
              maxWidth: 520,
            }}
          >
            {description}
          </FontStyle>
        </Box>

        {showLogo && (
          <Image
            src="/logo-pm-ticketing1.png"
            alt="logo-pm-ticketing"
            width={118}
            height={68}
            priority
          />
        )}
      </Stack>
    </Box>
  );
};

export default AuthPageHeader;
