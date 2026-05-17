"use client";

import React from "react";

import { Box, Chip, Divider, Grid, Paper, useMediaQuery, useTheme } from "@mui/material";

import { Icon } from "@iconify/react";

import FontStyle from "@/app/components/font-style/FontStyle";
import StatusTag from "../status-tag/StatusTag";
import { color } from "framer-motion";

const TicketStatusInformation = ({ data, showTicketStatus }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const theme = useTheme();

  /**
   * =========================
   * HIDE IF NOT NEEDED
   * =========================
   */
  if (data?.status !== "ditolak" && data?.status !== "selesai") {
    return null;
  }

  /**
   * =========================
   * REJECTED
   * =========================
   */
  const isRejected = data?.status === "ditolak";

  /**
   * =========================
   * COMPLETED
   * =========================
   */
  const isCompleted = data?.status === "selesai";

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 3,

        p: {
          xs: 2,
          md: 3,
        },

        borderRadius: 4,

        border: "1px solid",

        borderColor: isRejected ? "error.light" : "success.light",

        background: isRejected
          ? "linear-gradient(180deg, rgba(255,0,0,0.02) 0%, rgba(255,255,255,1) 100%)"
          : "linear-gradient(180deg, rgba(0,180,80,0.03) 0%, rgba(255,255,255,1) 100%)",

        boxShadow: "0 8px 24px rgba(0,0,0,0.05)",

        overflow: "hidden",
      }}
    >
      {/* =========================
          HEADER
      ========================= */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
        flexWrap="wrap"
        mb={2}
      >
        <Box display="flex" alignItems="center" gap={1.2}>
          <Box
            sx={{
              width: isMobile ? 56 : 44,
              height: isMobile ? 52 : 44,

              borderRadius: "50%",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              backgroundColor: isRejected ? "error.main" : "success.main",

              color: "#fff",

              boxShadow: isRejected
                ? "0 6px 18px rgba(255,0,0,0.18)"
                : "0 6px 18px rgba(0,180,80,0.18)",
            }}
          >
            <Icon
              icon={
                isRejected
                  ? "material-symbols:close"
                  : "material-symbols:task-alt-rounded"
              }
              fontSize={24}
            />
          </Box>

          <Box>
            <FontStyle
              sx={{
                fontSize: 15,
                fontWeight: 700,
                color: isRejected ? "error.main" : "success.main",
              }}
            >
              {isRejected ? "Laporan Ditolak" : "Laporan Diselesaikan"}
            </FontStyle>

            <FontStyle
              fontWeight="500"
              sx={{
                fontSize: 12,
                color: "text.disabled",
                mt: 0.2,
              }}
            >
              {isRejected ? (
                "Laporan tidak dapat diproses lebih lanjut"
              ) : (
                <>
                  Laporan telah selesai ditangani oleh{" "}
                  <span style={{ fontWeight: "bold" }}>
                    {data?.completed_by_name || "-"}
                  </span>
                </>
              )}
            </FontStyle>
          </Box>
        </Box>

        {/* PUBLISH STATUS */}
        {showTicketStatus && (
          <Box
            sx={{
              // mobile device display none
              "@media (max-width: 600px)": {
                display: "none",
              },
            }}
          >
            {isCompleted && (
              <StatusTag
                label={data?.is_public ? "Sudah Dipublish" : "Belum Dipublish"}
                color={data?.is_public ? theme.palette.primary.main : "gold"}
                icon="material-symbols:task-alt-rounded"
              />
            )}
          </Box>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* =========================
          CONTENT
      ========================= */}
      <Grid container spacing={2.5}>
        {/* ADMIN */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FontStyle
            sx={{
              fontSize: 12,
              fontWeight: 700,
              color: "text.disabled",
              //   mb: 0.5,
            }}
          >
            {isRejected ? "Ditolak Oleh" : "Diselesaikan Oleh"}
          </FontStyle>

          <FontStyle
            sx={{
              fontSize: 12,
              fontWeight: 600,
              lineHeight: 1.8,
            }}
          >
            {isRejected
              ? `${data?.rejected_by_name || "-"} `
              : `${data?.completed_by_name || "-"}`}
          </FontStyle>
        </Grid>

        {/* TIME */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FontStyle
            sx={{
              fontSize: 12,
              fontWeight: 700,
              color: "text.disabled",
              //   mb: 0.5,
            }}
          >
            {isRejected ? "Waktu Penolakan" : "Waktu Penyelesaian"}
          </FontStyle>

          <FontStyle
            sx={{
              fontWeight: 500,
              fontSize: 12,
              lineHeight: 1.8,
              color: "text.primary",
            }}
          >
            {isRejected
              ? data?.rejected_at_human || "-"
              : data?.completed_at_human || "-"}
          </FontStyle>
        </Grid>

        {/* REASON */}
        {isRejected && (
          <Grid size={12}>
            <FontStyle
              sx={{
                fontSize: 12,
                fontWeight: 700,
                color: "text.disabled",
                mb: 0.5,
              }}
            >
              Alasan Penolakan
            </FontStyle>

            <Box
              sx={{
                p: 2,

                borderRadius: 3,

                backgroundColor: "#fafafa",

                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <FontStyle
                sx={{
                  fontSize: 12,
                  fontWeight: 500,
                  lineHeight: 1.9,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {data?.rejected_reason}
              </FontStyle>
            </Box>
          </Grid>
        )}

        {/* PUBLISH INFO */}
        {showTicketStatus && isCompleted && (
          <Grid size={12}>
            <Box
              sx={{
                mt: 1,

                p: 2,

                borderRadius: 3,

                background: "#fafafa",

                border: `1px solid ${theme.palette.primary.main}`,
              }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FontStyle
                    sx={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "primary.main",
                      mb: 0.2,
                    }}
                  >
                    Laporan Berhasil Dipublish
                  </FontStyle>
                  <FontStyle
                    fontWeight="500"
                    sx={{
                      fontSize: 12,
                      color: "text.primary",
                      lineHeight: 1.8,
                    }}
                  >
                    Laporan ini telah dipublikasikan dan dapat dilihat oleh
                    publik.
                  </FontStyle>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FontStyle
                    sx={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "primary.main",
                      mb: 0.2,
                    }}
                  >
                    Waktu Dipublikasikan
                  </FontStyle>
                  <FontStyle
                    sx={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "text.primary",
                    }}
                  >
                    {data?.published_at_human}
                  </FontStyle>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default TicketStatusInformation;
