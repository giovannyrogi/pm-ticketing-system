"use client";

import FontStyle from "@/app/components/font-style/FontStyle";
import { Box } from "@mui/material";
import { Icon } from "@iconify/react";

const TicketWaitingReplyInfo = ({
  waitingReplyFrom,
  currentRole,
  status,
  userName,
}) => {
  /**
   * =========================
   * ONLY STATUS PROSES
   * =========================
   */
  if (status !== "proses") return null;

  if (!waitingReplyFrom) return null;

  /**
   * =========================
   * CURRENT SIDE
   * =========================
   */
  const currentSide = ["admin", "superadmin"].includes(currentRole)
    ? "staff"
    : "user";

  /**
   * =========================
   * HIDE IF MY TURN
   * =========================
   */
  const isMyTurn = waitingReplyFrom === currentSide;

  if (isMyTurn) return null;

  const isWaitingStaff = waitingReplyFrom === "staff";

  const isWaitingUser = waitingReplyFrom === "user";

  return (
    <Box
      sx={{
        mt: 3,

        p: {
          xs: 1.8,
          sm: 2,
        },

        borderRadius: 3,

        display: "flex",

        alignItems: {
          xs: "flex-start",
          sm: "center",
        },

        gap: {
          xs: 1.5,
          sm: 2,
        },

        border: "1px solid",

        borderColor: "warning.light",

        backgroundColor: "rgba(255,152,0,0.08)",

        transition: "0.25s ease",
      }}
    >
      <Box
        sx={{
          width: {
            xs: 46,
            sm: 48,
          },

          height: {
            xs: 46,
            sm: 48,
          },

          minWidth: {
            xs: 46,
            sm: 48,
          },

          minHeight: {
            xs: 46,
            sm: 48,
          },

          borderRadius: "50%",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          flexShrink: 0,

          backgroundColor: "warning.main",

          boxShadow: "0 4px 12px rgba(255,152,0,0.25)",
        }}
      >
        <Icon icon="svg-spinners:ring-resize" width={31} color="#fff" />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <FontStyle
          sx={{
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "Poppins, sans-serif",
            color: "warning.dark",
          }}
        >
          {isWaitingStaff
            ? "Mohon menunggu balasan Admin"
            : isWaitingUser
              ? "Mohon Menunggu balasan"
              : ""}
        </FontStyle>

        <FontStyle
          sx={{
            mt: 0.2,

            fontSize: 12,

            color: "text.disabled",

            fontWeight: 500,
          }}
        >
          {isWaitingStaff ? (
            "Pesan Anda sedang diproses oleh Admin, mohon menunggu."
          ) : isWaitingUser ? (
            <>
              Pesan Anda sudah terkirim dan sedang menunggu balasan dari{" "}
              <Box
                component="span"
                sx={{
                  fontWeight: 600,
                  color: "text.disabled",
                }}
              >
                {userName || "User"}
              </Box>
              .
            </>
          ) : (
            ""
          )}
        </FontStyle>
      </Box>
    </Box>
  );
};

export default TicketWaitingReplyInfo;
