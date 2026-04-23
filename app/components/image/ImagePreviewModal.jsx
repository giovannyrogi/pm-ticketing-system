"use client";

import { Modal, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ImagePreviewModal = ({ open, image, onClose }) => {
  if (!image) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(4px)",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          maxWidth: "90vw",
          maxHeight: "90vh",
          outline: "none",
        }}
      >
        {/* IMAGE */}
        <img
          src={image}
          alt="preview-large"
          style={{
            width: "100%",
            height: "100%",
            maxHeight: "90vh",
            objectFit: "contain",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
          }}
        />

        {/* CLOSE BUTTON */}
        <Box
          onClick={onClose}
          sx={{
            position: "absolute",
            top: -15,
            right: -15,
            width: 36,
            height: 36,
            borderRadius: "50%",
            bgcolor: "error.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "0.2s",
            // "&:hover": {
            //   bgcolor: "error.main",
            // },
          }}
        >
          <CloseIcon sx={{ color: "#fff", fontSize: 20 }} />
        </Box>
      </Box>
    </Modal>
  );
};

export default ImagePreviewModal;
