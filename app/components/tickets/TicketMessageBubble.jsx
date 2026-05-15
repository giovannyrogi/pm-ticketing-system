"use client";

import FontStyle from "@/app/components/font-style/FontStyle";
import { Box, Divider, useTheme } from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import ImagePreviewModal from "../image/ImagePreviewModal";
import StatusTag from "../status-tag/StatusTag";

const TicketMessageBubble = ({
  message,
  isAdmin = false,
  isPublic = false,
}) => {

  const theme = useTheme();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewImage(null);
  };

  return (
    <Box
      display="flex"
      justifyContent={isAdmin ? "flex-start" : "flex-end"}
      mb={4}
    >
      <Box
        sx={{
          width: {
            xs: "100%",
            sm: "85%",
            md: "52%",
            lg: "48%",
          },

          p: 2,

          borderRadius: 3,

          backgroundColor: "#fff",

          border: "1px solid",

          borderColor: "rgba(0, 0, 0, 0.20)",
          //   borderColor: isAdmin ? "rgba(255,0,0,0.14)" : "rgba(0,0,0,0.06)",

          boxShadow: "0 4px 14px rgba(0,0,0,0.04)",

          overflow: "hidden",

          transition: "0.2s",

          "&:hover": {
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          },
        }}
      >
        {/* HEADER */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
          mb={0.5}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <FontStyle
              fontSize={12}
              fontWeight="bold"
              sx={{
                color: isAdmin ? "primary.main" : "text.primary",
              }}
            >
              {isPublic && message?.sender_role === "user"
                ? "Anonymous"
                : message?.sender_name?.charAt(0).toUpperCase() +
                    message?.sender_name?.slice(1) || "Unknown User"}
            </FontStyle>

            {["admin", "superadmin"].includes(message?.sender_role) && (
              <Box
                sx={{
                  position: "relative",

                  overflow: "hidden",

                  borderRadius: "6px",

                  display: "inline-flex",

                  alignItems: "center",

                  justifyContent: "center",

                  isolation: "isolate",

                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",

                  animation: "ticketTagFloat 3s ease-in-out infinite",

                  "&::before": {
                    content: '""',

                    position: "absolute",

                    top: 0,
                    left: "-120%",

                    width: "60%",
                    height: "100%",

                    background:
                      "linear-gradient(120deg, transparent, rgba(255,255,255,0.55), transparent)",

                    transform: "skewX(-20deg)",

                    animation: "ticketTagShine 2.8s ease-in-out infinite",

                    zIndex: 2,

                    pointerEvents: "none",
                  },
                }}
              >
                <StatusTag
                  label={message?.sender_role}
                  fontSize={10}
                  color={"geekblue"}
                />
              </Box>
            )}
          </Box>
          <FontStyle
            fontSize={11}
            fontWeight="500"
            sx={{
              color: "text.disabled",
              whiteSpace: "nowrap",
            }}
          >
            {message?.created_at_human}
          </FontStyle>
        </Box>

        <Divider sx={{ mb: 1 }} />

        {/* MESSAGE */}
        {/* <FontStyle
          fontSize={12}
          fontWeight="bold"
          color="text.disabled"
          mb={0.5}
          mt={2}
        >
          Pesan
        </FontStyle> */}
        <Box
          sx={{
            p: 1.5,
            mt: 2,
            border: "1px solid rgba(0,0,0,0.20)",
            borderRadius: 2,
            backgroundColor: "#fafafa",
          }}
        >
          <FontStyle
            fontSize={13}
            fontWeight="500"
            sx={{
              lineHeight: 1.6,

              wordBreak: "break-word",

              overflowWrap: "anywhere",

              whiteSpace: "pre-wrap",

              color: "text.primary",
              textAlign: "justify",
            }}
          >
            {message.message}
          </FontStyle>
        </Box>

        {/* IMAGES */}
        {message.images?.length > 0 && (
          <>
            <FontStyle
              fontSize={12}
              fontWeight="bold"
              color="text.disabled"
              mt={2}
              mb={0.5}
            >
              Lampiran
            </FontStyle>

            <Box
              display="grid"
              gap={2}
              sx={{
                gridTemplateColumns: {
                  xs: message.images.length === 1 ? "1fr" : "1fr 1fr",

                  md:
                    message.images.length === 1
                      ? "180px"
                      : message.images.length === 2
                        ? "repeat(2, 140px)"
                        : "repeat(3, 120px)",
                },

                justifyContent: "flex-start",
              }}
            >
              {message.images.map((img, i) => (
                <Box
                  key={i}
                  onClick={() => {
                    setPreviewImage(img);
                    setPreviewOpen(true);
                  }}
                  sx={{
                    position: "relative",

                    width: "100%",

                    height: {
                      xs: 120,
                      sm: 130,
                      md: 120,
                    },

                    maxWidth:
                      message.images.length === 1
                        ? {
                            xs: "100%",
                            sm: 220,
                          }
                        : undefined,

                    borderRadius: 2.5,

                    overflow: "hidden",

                    border: "1px solid rgba(0,0,0,0.06)",

                    backgroundColor: "#f8f8f8",

                    cursor: "pointer",

                    transition: "0.25s",

                    flexShrink: 0,

                    "&:hover img": {
                      transform: "scale(1.05)",
                    },

                    "&:hover": {
                      boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  <Image
                    src={img}
                    alt={`attachment-${i}`}
                    fill
                    unoptimized
                    style={{
                      objectFit: "cover",
                      display: "block",
                      transition: "transform 0.3s ease",
                    }}
                  />
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>
      <ImagePreviewModal
        open={previewOpen}
        image={previewImage}
        onClose={handleClosePreview}
      />
    </Box>
  );
};

export default TicketMessageBubble;
