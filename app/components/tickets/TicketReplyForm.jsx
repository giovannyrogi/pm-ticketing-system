"use client";

import FontStyle from "@/app/components/font-style/FontStyle";
import { Box, Button, CircularProgress, Stack, TextField } from "@mui/material";

import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";
import { useState } from "react";
import ImagePreviewModal from "../image/ImagePreviewModal";

const TicketReplyForm = ({
  message,
  setMessage,
  onSubmit,
  loading,

  images = [],
  previewImages = [],

  handleImageChange,
  handleRemoveImage,
  data,
  DESC_MAX,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewImage(null);
  };

  const handlePreviewImage = (src) => {
    setPreviewImage(src);
    setPreviewOpen(true);
  };

  return (
    <Box mt={6}>
      {/* TITLE */}
      <FontStyle
        fontSize={15}
        fontWeight="bold"
        sx={{
          mb: 1.5,
        }}
      >
        Balas Pesan
      </FontStyle>

      {/* INPUT */}
      <TextField
        multiline
        rows={5}
        fullWidth
        placeholder="Tulis balasan..."
        value={message}
        onChange={(e) => {
          if (e.target.value.length <= DESC_MAX) {
            setMessage(e.target.value);
          }
        }}
        sx={{
          backgroundColor: "#fff",

          "& .MuiOutlinedInput-root": {
            borderRadius: 3,
          },
        }}
      />

      <FontStyle
        sx={{
          fontSize: 11,
          fontWeight: "bold",
          fontFamily: "Poppins, sans-serif",
          textAlign: "right",
          mt: 0.7,
          mb: -1.5,
          color:
            message.length >= DESC_MAX
              ? "error.main"
              : message.length >= DESC_MAX * 0.9
                ? "warning.main"
                : "text.disabled",
        }}
      >
        {message?.length <= DESC_MAX
          ? `Karakter tersisa ${DESC_MAX - message.length}/${DESC_MAX}`
          : `Karakter tersisa ${DESC_MAX * 0.9 - message.length}/${DESC_MAX}`}
      </FontStyle>

      {/* IMAGE */}
      <Box mt={2}>
        <FontStyle
          sx={{
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Upload Gambar (Opsional)
        </FontStyle>
        <FontStyle
          sx={{
            fontSize: 10,
            fontWeight: "bold",
            fontFamily: "Poppins, sans-serif",
            mb: 1.5,
            color: "error.main",
          }}
        >
          Maksimal 3 gambar, Ukuran 3MB. Format: JPG, PNG.
        </FontStyle>

        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          {/* PREVIEW */}
          {previewImages.map((src, index) => (
            <Box
              key={index}
              sx={{
                width: 90,
                height: 90,

                borderRadius: 2,

                overflow: "hidden",

                position: "relative",

                border: "1px solid #eee",

                backgroundColor: "#fff",

                cursor: "pointer",
              }}
            >
              <Box
                onClick={() => handlePreviewImage(src)}
                sx={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                }}
              >
                <Image
                  src={src}
                  alt={`preview-${index}`}
                  fill
                  unoptimized
                  style={{
                    objectFit: "cover",
                  }}
                  // loading="eager"
                />
              </Box>

              <Box
                onClick={() => handleRemoveImage(index)}
                sx={{
                  position: "absolute",

                  top: 5,
                  right: 5,

                  width: 22,
                  height: 22,

                  borderRadius: "50%",

                  bgcolor: "rgba(0,0,0,0.6)",

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  cursor: "pointer",

                  "&:hover": {
                    bgcolor: "error.main",
                  },
                }}
              >
                <CloseIcon
                  sx={{
                    fontSize: 14,
                    color: "#fff",
                  }}
                />
              </Box>
            </Box>
          ))}

          {/* BUTTON */}
          {images.length < 3 && (
            <label htmlFor="reply-upload">
              <Box
                sx={{
                  width: 85,
                  height: 85,
                  borderRadius: "10px",
                  border: "2px dashed #ccc",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.25s",

                  //  default child color
                  "& .upload-icon": {
                    color: "text.disabled",
                    transition: "0.25s",
                  },
                  "& .upload-text": {
                    color: "text.disabled",
                    transition: "0.25s",
                  },

                  // hover effect
                  "&:hover": {
                    borderColor: "primary.main",
                    backgroundColor: "rgba(25,118,210,0.05)",
                    // transform: "scale(1.05)",

                    // ubah icon & text saat hover
                    "& .upload-icon": {
                      color: "primary.main",
                    },
                    "& .upload-text": {
                      color: "primary.main",
                    },
                  },
                }}
              >
                <AddPhotoAlternateIcon
                  className="upload-icon"
                  sx={{
                    fontSize: 28,
                    color: "text.disabled",
                  }}
                />

                <FontStyle
                  className="upload-text"
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    mt: 0.5,
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  Upload
                </FontStyle>
              </Box>
            </label>
          )}

          <input
            id="reply-upload"
            hidden
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />
        </Box>
      </Box>

      {/* BUTTON */}
      <Stack direction="row" justifyContent="flex-end" mt={3}>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={loading || !message?.trim()}
          sx={{
            minWidth: 180,

            height: 48,

            borderRadius: 3,

            fontWeight: 700,

            textTransform: "none",

            fontSize: 14,

            boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
          }}
          startIcon={
            loading ? <CircularProgress size={18} color="inherit" /> : null
          }
        >
          {loading ? "Mengirim..." : "Kirim Balasan"}
        </Button>
      </Stack>
      <ImagePreviewModal
        open={previewOpen}
        image={previewImage}
        onClose={handleClosePreview}
      />
    </Box>
  );
};

export default TicketReplyForm;
