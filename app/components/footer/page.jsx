"use client";
import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

const Footer = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        py: 1,
        bgcolor: "transparent",
        zIndex: 1300, // pastikan di atas konten lain jika perlu
        textAlign: "center",
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{ letterSpacing: 0.8, fontSize: "12px" }}
      >
        Copyright © 2025 - Perumda Pasar Manado
      </Typography>
    </Box>
  );
};

export default Footer;
