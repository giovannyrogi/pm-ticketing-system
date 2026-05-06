"use client";

import FontStyle from "@/app/components/font-style/FontStyle";
import { Icon } from "@iconify/react";
import { Box, Grid } from "@mui/material";
import Image from "next/image";
import ImagePreviewModal from "../image/ImagePreviewModal";
import { useState } from "react";

const TicketAttachments = ({ data, isMobile }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewImage(null);
  };

  return (
    <Grid size={12} mb={1} mt={2}>
      <FontStyle fontSize={12} fontWeight="bold" color="text.disabled">
        Lampiran
      </FontStyle>

      {data.images?.length > 0 ? (
        <Box
          sx={{
            mt: 1.5,

            display: "grid",

            gap: 2,

            gridTemplateColumns: {
              xs: "1fr",

              sm:
                data.images.length === 1
                  ? "minmax(320px, 720px)"
                  : data.images.length === 2
                    ? "1fr 1fr"
                    : "1fr 1fr",

              lg:
                data.images.length === 1
                  ? "minmax(420px, 760px)"
                  : data.images.length === 2
                    ? "1fr 1fr"
                    : "1fr 1fr 1fr",
            },

            justifyContent: data.images.length === 1 ? "flex-start" : "stretch",
          }}
        >
          {data.images.map((img, i) => (
            <Box
              key={i}
              sx={{
                position: "relative",

                borderRadius: 3,

                overflow: "hidden",

                cursor: "pointer",

                backgroundColor: "#f8f8f8",

                border: "1px solid rgba(0,0,0,0.06)",

                boxShadow: "0 4px 14px rgba(0,0,0,0.04)",

                transition: "all 0.25s ease",

                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.10)",
                },
              }}
            >
              <Box
                onClick={() => {
                  setPreviewImage(img);
                  setPreviewOpen(true);
                }}
                sx={{
                  position: "relative",

                  width: "100%",

                  aspectRatio:
                    data.images.length === 1
                      ? isMobile
                        ? "4/3"
                        : "16/5"
                      : data.images.length === 2
                        ? "6/3"
                        : "4/3",

                  minHeight:
                    data.images.length === 1
                      ? {
                          xs: 140,
                          sm: 180,
                          md: 220,
                        }
                      : data.images.length === 2
                        ? {
                            xs: 180,
                            sm: 220,
                            md: 240,
                          }
                        : {
                            xs: 180,
                            sm: 220,
                            md: 260,
                          },

                  overflow: "hidden",

                  "& img": {
                    transition: "transform 0.35s ease",
                  },

                  "&:hover img": {
                    transform: "scale(1.04)",
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
                  }}
                  loading="eager"
                />
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            mt: 1,
            p: 2,
            border: "1px dashed #ddd",
            borderRadius: 2,
            textAlign: "center",
            color: "text.disabled",
          }}
        >
          <Icon icon="mdi:image-off-outline" width={26} />
          <FontStyle fontSize={12}>Tidak ada gambar</FontStyle>
        </Box>
      )}

      <ImagePreviewModal
        open={previewOpen}
        image={previewImage}
        onClose={handleClosePreview}
      />
    </Grid>
  );
};

export default TicketAttachments;
