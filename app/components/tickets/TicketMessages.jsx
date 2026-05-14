"use client";

import FontStyle from "@/app/components/font-style/FontStyle";
import { Box, Divider } from "@mui/material";
import TicketMessageBubble from "./TicketMessageBubble";

const TicketMessages = ({ messages = [], isPublic = false }) => {
  return (
    <Box>
      <FontStyle fontSize={14} fontWeight="bold" sx={{ mb: 1 }}>
        Riwayat Percakapan
      </FontStyle>

      <Divider sx={{ mb: 2 }} />

      {messages.length === 0 ? (
        <Box
          sx={{
            p: 3,
            borderRadius: 3,
            textAlign: "center",
            backgroundColor: "#fafafa",
            border: "1px dashed #ddd",
          }}
        >
          <FontStyle fontWeight="500" fontSize={12} color="text.disabled">
            Belum ada percakapan
          </FontStyle>
        </Box>
      ) : (
        messages.map((msg) => (
          <TicketMessageBubble
            key={msg.id}
            message={msg}
            isPublic={isPublic}
            isAdmin={["admin", "superadmin", "staff"].includes(
              msg?.sender_role,
            )}
          />
        ))
      )}
    </Box>
  );
};

export default TicketMessages;
