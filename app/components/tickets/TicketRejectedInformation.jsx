"use client";

import React from "react";
import { Box, Grid, Paper } from "@mui/material";
import FontStyle from "@/app/components/font-style/FontStyle";

const TicketRejectedInformation = ({ data }) => {
  if (data?.status !== "ditolak") return null;

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 3,
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "error.light",
        boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
      }}
    >
      <FontStyle
        sx={{
          fontSize: 14,
          fontWeight: "bold",
          color: "error.main",
          mb: 2,
          fontFamily: "Poppins, sans-serif",
        }}
      >
        Laporan ini telah ditolak
      </FontStyle>

      <Grid container spacing={2}>
        <Grid size={12}>
          <FontStyle
            sx={{
              fontSize: 12,
              fontWeight: "bold",
              color: "text.disabled",
              mb: 0.5,
            }}
          >
            Ditolak Oleh
          </FontStyle>

          <FontStyle
            sx={{
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {data?.rejected_by_name || "-"} (
            {data?.rejected_by_role || "-"})
          </FontStyle>
        </Grid>

        <Grid size={12}>
          <FontStyle
            fontWeight="bold"
            sx={{
              fontSize: 12,
              color: "text.disabled",
              mb: 0.5,
            }}
          >
            Waktu Penolakan
          </FontStyle>

          <FontStyle
            sx={{
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {data?.rejected_at_human || "-"}
          </FontStyle>
        </Grid>

        <Grid size={12}>
          <FontStyle
            sx={{
              fontSize: 12,
              fontWeight: "bold",
              color: "text.disabled",
              mb: 0.5,
            }}
          >
            Alasan Penolakan
          </FontStyle>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: "#fafafa",
              border: "1px solid #eee",
            }}
          >
            <FontStyle
              fontWeight="500"
              sx={{
                fontSize: 12,
                lineHeight: 1.8,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {data?.rejected_reason}
            </FontStyle>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TicketRejectedInformation;