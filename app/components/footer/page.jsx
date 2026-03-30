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
        color="text.disabled"
        align="center"
        sx={{ letterSpacing: 0.8, fontSize: "12px", fontWeight: 500, fontFamily: "Poppins" }}
      >
        Copyright © 2026 - Perumda Pasar Manado
      </Typography>
    </Box>
  );
};

export default Footer;
