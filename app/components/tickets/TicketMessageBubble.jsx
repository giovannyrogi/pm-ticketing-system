"use client";

import FontStyle from "@/app/components/font-style/FontStyle";
import { Box, Divider } from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import ImagePreviewModal from "../image/ImagePreviewModal";

const TicketMessageBubble = ({ message, isAdmin = false }) => {
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
          <FontStyle
            fontSize={12}
            fontWeight="bold"
            sx={{
              color: isAdmin ? "primary.main" : "text.primary",
            }}
          >
            {message?.sender_name?.charAt(0).toUpperCase() +
              message?.sender_name?.slice(1)}
          </FontStyle>

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
