"use client";

import FontStyle from "@/app/components/font-style/FontStyle";
import { Icon } from "@iconify/react";
import { Box, Divider, Paper } from "@mui/material";

const DashboardPanel = ({
  title,
  subtitle,
  action,
  children,
  icon,
  iconColor = "primary.main",
  iconTone = "rgba(230,9,9,0.10)",
  sx = {},
}) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 1.5, md: 2.2 },
        borderRadius: 2.5,
        border: "1px solid rgba(0,0,0,0.10)",
        background:
          "linear-gradient(135deg, rgba(248,250,252,0.92) 0%, rgba(255,255,255,1) 54%)",
        height: "100%",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
        overflow: "hidden",
        position: "relative",
        ...sx,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -42,
          right: -42,
          width: 120,
          height: 120,
          borderRadius: "50%",
          bgcolor: iconTone,
          opacity: 0.45,
          pointerEvents: "none",
        }}
      />

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "flex-start" }}
        gap={2}
        flexDirection={{ xs: "column", sm: "row" }}
        mb={1}
        position="relative"
        zIndex={1}
      >
        <Box display="flex" alignItems="center" gap={1.2} minWidth={0}>
          {icon && (
            <Box
              sx={{
                width: { xs: 38, md: 42 },
                height: { xs: 38, md: 42 },
                borderRadius: "50%",
                bgcolor: iconTone,
                color: iconColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon icon={icon} fontSize={22} />
            </Box>
          )}

          <Box minWidth={0}>
            <FontStyle
              sx={{
                fontSize: { xs: 14, md: 15 },
                fontWeight: 700,
                letterSpacing: 0,
                color: iconColor,
                lineHeight: 1.2,
                letterSpacing: 0.5,
              }}
            >
              {title}
            </FontStyle>

            {subtitle && (
              <FontStyle
                sx={{
                  mt: 0.35,
                  fontSize: { xs: 10.5, md: 11.5 },
                  fontWeight: 650,
                  color: "rgba(35,35,35,0.58)",
                  letterSpacing: 0,
                  lineHeight: 1.45,
                  fontSize: 12,
                }}
              >
                {subtitle}
              </FontStyle>
            )}
          </Box>
        </Box>

        {action}
      </Box>

      <Divider sx={{ mb: 2, borderColor: "rgba(15, 23, 42, 0.14)" }} />

      <Box position="relative" zIndex={1}>
        {children}
      </Box>
    </Paper>
  );
};

export default DashboardPanel;
