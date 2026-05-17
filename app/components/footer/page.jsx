"use client";

import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",

        pt: 1,
        pb: 1,

        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography
        color="text.disabled"
        align="center"
        sx={{
          letterSpacing: 0.6,
          fontSize: 12,
          fontWeight: 500,
          fontFamily: "Poppins",
        }}
      >
        Copyright © 2026 - Perumda Pasar Manado
      </Typography>
    </Box>
  );
};

export default Footer;
