"use client";

import React from "react";
import { Box, Button, Stack, useMediaQuery } from "@mui/material";

const FixedBottomActions = ({ actions = [], show = true }) => {
  const isMobile = useMediaQuery("(max-width:1300px)");

  if (!show) return null;

  return (
    <Box
      sx={{
        position: "fixed",

        bottom: 0,

        left: {
          xs: 0,
          lg: "16.666%",
        },

        width: {
          xs: "100%",
          lg: "83.333%",
        },

        zIndex: 1200,

        bgcolor: "background.paper",

        borderTop: "1px solid",

        borderColor: "divider",

        boxShadow: "0px -4px 24px rgba(0,0,0,0.08)",

        borderTopLeftRadius: 10,

        borderTopRightRadius: 10,

        // borderRadius: 0,

        overflow: "hidden",
      }}
    >
      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={isMobile ? 2.5 : 4}
        justifyContent="flex-end"
        sx={{
          p: 2,
        }}
      >
        {actions.map((action, index) => (
          <Button
            key={index}
            fullWidth={isMobile}
            variant={action.variant || "contained"}
            color={action.color || "primary"}
            onClick={action.onClick}
            startIcon={action.icon || null}
            disabled={action.disabled}
            sx={{
              height: 40,

              minWidth: isMobile ? "100%" : 220,

              px: isMobile ? 2 : 4,

              borderRadius: 3,

              fontWeight: 700,

              textTransform: "none",

              fontSize: 14,

              fontFamily: "Poppins, sans-serif",

              boxShadow:
                action.variant === "contained"
                  ? "0 4px 12px rgba(0,0,0,0.12)"
                  : "none",

              ...(action.sx || {}),
            }}
          >
            {action.label}
          </Button>
        ))}
      </Stack>
    </Box>
  );
};

export default FixedBottomActions;
