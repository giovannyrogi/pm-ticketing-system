"use client";

import { forwardRef } from "react";
import { Icon } from "@iconify/react";
import { Alert, Box, Slide, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import Snackbar from "@mui/material/Snackbar";

const severityConfig = {
  success: {
    icon: "solar:check-circle-bold-duotone",
    color: "#16A34A",
    softColor: "#DCFCE7",
  },
  error: {
    icon: "solar:danger-triangle-bold-duotone",
    color: "#E60909",
    softColor: "#FEE2E2",
  },
  warning: {
    icon: "solar:danger-circle-bold-duotone",
    color: "#D97706",
    softColor: "#FEF3C7",
  },
  info: {
    icon: "solar:info-circle-bold-duotone",
    color: "#0284C7",
    softColor: "#E0F2FE",
  },
};

const SnackbarTransition = forwardRef(function SnackbarTransition(props, ref) {
  return (
    <Slide
      {...props}
      ref={ref}
      direction="down"
      timeout={{ enter: 360, exit: 240 }}
    />
  );
});

export default function Notification({
  open,
  message,
  severity = "info",
  onClose,
  ...props
}) {
  const theme = useTheme();
  const config = severityConfig[severity] || severityConfig.info;

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      TransitionComponent={SnackbarTransition}
      sx={{
        zIndex: 9999999,
        width: { xs: "calc(100% - 28px)", sm: "auto" },
        top: { xs: "18px !important", sm: "24px !important" },
      }}
      {...props}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        icon={
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.6,
              display: "grid",
              placeItems: "center",
              bgcolor: config.softColor,
              color: config.color,
              flexShrink: 0,
              boxShadow: `inset 0 0 0 1px ${alpha(config.color, 0.1)}`,
            }}
          >
            <Icon icon={config.icon} fontSize={22} />
          </Box>
        }
        sx={{
          width: "100%",
          minWidth: { xs: "100%", sm: 420 },
          maxWidth: { xs: "100%", sm: 620 },
          alignItems: "center",
          borderRadius: 2.2,
          border: `1px solid ${alpha(config.color, 0.18)}`,
          bgcolor: "rgba(255,255,255,0.96)",
          color: "rgba(15,23,42,0.86)",
          boxShadow: `0 6px 18px ${alpha(config.color, 0.1)}, 0 2px 8px rgba(15,23,42,0.06)`,
          backdropFilter: "blur(10px)",
          overflow: "hidden",
          p: { xs: "9px 12px 9px 11px", sm: "10px 14px 10px 12px" },
          display: "flex",
          "&:before": {
            content: '""',
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 5,
            bgcolor: config.color,
          },
          "& .MuiAlert-icon": {
            mr: 1.2,
            p: 0,
            opacity: 1,
          },
          "& .MuiAlert-message": {
            py: 0,
            pr: { xs: 1.2, sm: 1.6 },
            flex: 1,
            minWidth: 0,
            fontFamily: "Poppins, sans-serif",
            fontSize: { xs: 12.5, sm: 13.5 },
            fontWeight: 700,
            lineHeight: 1.55,
            wordBreak: "break-word",
          },
          "& .MuiAlert-action": {
            alignItems: "center",
            p: 0,
            ml: "auto",
            pl: { xs: 1, sm: 1.2 },
            pr: 0.2,
            flexShrink: 0,
          },
          "& .MuiAlert-action .MuiIconButton-root": {
            width: 32,
            height: 32,
            color: alpha(theme.palette.text.primary, 0.68),
            borderRadius: 1.4,
            border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
            bgcolor: alpha(theme.palette.text.primary, 0.035),
            transition: "all 180ms ease",
            "&:hover": {
              color: config.color,
              bgcolor: alpha(config.color, 0.08),
            },
          },
        }}
        variant="standard"
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
