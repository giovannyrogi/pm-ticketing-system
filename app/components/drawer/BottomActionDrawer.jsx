"use client";

import React from "react";
import {
  Box,
  Button,
  Divider,
  Drawer,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const BottomActionDrawer = ({
  open = false,
  onClose,
  title = "Actions",
  description = "",
  children,

  // array button flexible
  actions = [],

  // optional
  maxWidth = 700,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,

          px: isMobile ? 2 : 3,
          pt: 1.5,
          pb: 3,

          width: "100%",
          maxWidth,

          mx: "auto",

          bgcolor: "background.paper",

          boxShadow: "0px -10px 40px rgba(0,0,0,0.15)",

          overflow: "hidden",
        },
      }}
    >
      {/* HANDLE BAR */}
      <Box
        sx={{
          width: 55,
          height: 5,
          borderRadius: 10,
          bgcolor: "grey.400",
          mx: "auto",
          mb: 2,
        }}
      />

      {/* HEADER */}
      <Box mb={2}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 20,
            fontFamily: "Poppins, sans-serif",
          }}
        >
          {title}
        </Typography>

        {description && (
          <Typography
            sx={{
              mt: 0.5,
              color: "text.secondary",
              fontSize: 13,
              lineHeight: 1.6,
              fontFamily: "Poppins, sans-serif",
            }}
          >
            {description}
          </Typography>
        )}
      </Box>

      {/* CONTENT */}
      {children && (
        <>
          <Box mb={3}>{children}</Box>
          <Divider sx={{ mb: 2 }} />
        </>
      )}

      {/* ACTIONS */}
      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={1.5}
      >
        {actions.map((action, index) => (
          <Button
            key={index}
            fullWidth
            variant={action.variant || "contained"}
            color={action.color || "primary"}
            startIcon={action.icon || null}
            onClick={action.onClick}
            disabled={action.disabled}
            sx={{
              height: 48,
              borderRadius: 3,
              fontWeight: 700,
              textTransform: "none",
              fontSize: 14,
              fontFamily: "Poppins, sans-serif",

              ...(action.sx || {}),
            }}
          >
            {action.label}
          </Button>
        ))}
      </Stack>
    </Drawer>
  );
};

export default BottomActionDrawer;