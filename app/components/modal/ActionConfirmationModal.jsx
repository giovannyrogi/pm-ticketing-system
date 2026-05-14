"use client";

import {
  Box,
  Button,
  CircularProgress,
  Fade,
  Modal,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { Icon } from "@iconify/react";
import FontStyle from "../font-style/FontStyle";

const ActionConfirmationModal = ({
  open,
  onClose,

  title = "Konfirmasi",
  description = "",

  icon = "material-symbols:warning-rounded",

  color = "success",
  textColor = "success",

  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",

  onConfirm,

  loading = false,

  hideCancel = false,
}) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  const theme = useTheme();

  const style = {
    position: "absolute",

    top: "50%",
    left: "50%",

    transform: "translate(-50%, -50%)",

    width: isMobile ? "90vw" : 420,

    maxWidth: "95vw",

    bgcolor: "background.paper",

    borderRadius: "20px",

    boxShadow: "0 10px 40px rgba(0,0,0,0.12)",

    p: isMobile ? 2.5 : "28px 32px",

    outline: "none",
  };

  return (
    <Modal
      open={open}
      onClose={loading ? null : onClose}
      closeAfterTransition
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(30,30,30,0.25)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        },
      }}
    >
      <Fade in={open}>
        <Box sx={style}>
          {/* ICON */}
          <Box display="flex" flexDirection="column" alignItems="center">
            <Box
              sx={{
                background: theme.palette[color].main,

                borderRadius: "50%",

                width: 82,
                height: 82,

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                mb: 2,

                boxShadow: `0 6px 18px ${theme.palette[color].main}40`,
              }}
            >
              <Icon icon={icon} fontSize={46} color="#FFF" />
            </Box>

            {/* TITLE */}
            <FontStyle
              sx={{
                fontSize: 22,
                fontWeight: 700,
                fontFamily: "Poppins",
                mb: 2,
                color: textColor,
                textAlign: "center",
              }}
            >
              {title}
            </FontStyle>

            {/* DESCRIPTION */}
            <FontStyle
              sx={{
                fontSize: 14,
                lineHeight: 1.8,
                fontWeight: 500,
                fontFamily: "Poppins",
                color: "text.disabled",
                textAlign: "center",
                mb: 4,
              }}
            >
              {description}
            </FontStyle>
          </Box>

          {/* ACTIONS */}
          <Box
            display="flex"
            gap={isMobile ? 2 : 4}
            flexDirection={isMobile ? "column-reverse" : "row"}
          >
            {!hideCancel && (
              <Button
                fullWidth
                variant="outlined"
                onClick={onClose}
                disabled={loading}
                sx={{
                  height: 46,

                  borderRadius: 3,

                  textTransform: "none",

                  fontWeight: 600,

                  borderColor: "rgba(0,0,0,0.10)",

                  color: "error",
                  border: `1px solid ${theme.palette.error.main}`,
                }}
              >
                {cancelText}
              </Button>
            )}

            <Button
              fullWidth
              variant="contained"
              onClick={onConfirm}
              disabled={loading}
              color={color}
              sx={{
                height: 46,

                borderRadius: 3,

                textTransform: "none",

                fontWeight: 700,

                boxShadow: "0 4px 14px rgba(0,0,0,0.10)",
              }}
            >
              {loading ? "Loading..." : confirmText}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ActionConfirmationModal;
