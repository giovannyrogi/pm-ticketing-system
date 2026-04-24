import {
  Box,
  Button,
  CircularProgress,
  Modal,
  Typography,
  useMediaQuery,
  useTheme,
  Fade,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";

const DeleteTicket = ({
  open,
  onClose,
  loadingTrue,
  loadingFalse,
  loading,
  getAllData,
  onNotify,
  selectedData,
}) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    loadingTrue();
    try {
      const response = await axios.delete(
        `/api/my-tickets/delete-ticket/${selectedData?.id}`,
      );

      if (response?.data.success) {
        onNotify &&
          onNotify({
            open: true,
            message: response.data.message || "Data Tiket berhasil dihapus!",
            severity: "success",
          });
        getAllData?.();
        setTimeout(() => {
          onClose();
          loadingFalse();
        }, 1000);
      } else {
        onNotify &&
          onNotify({
            open: true,
            message: response?.data.message || "Gagal menghapus data Tiket .",
            severity: "error",
          });
      }
    } catch (error) {
      console.error("Error deleting data Tiket :", error);
      onNotify &&
        onNotify({
          open: true,
          message:
            error.response.data.message ||
            "Terjadi error saat menghapus data Tiket .",
          severity: "error",
        });
    }
    setTimeout(() => {
      loadingFalse();
    }, 1000);
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isMobile ? "90vw" : 400,
    maxWidth: "95vw",
    bgcolor: "background.paper",
    color: "text.primary",
    borderRadius: "16px",
    boxShadow: 24,
    p: isMobile ? 2 : "24px 32px 24px 32px",
    outline: "none",
    transition: "box-shadow 0.3s",
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box
              sx={{
                background: theme.palette.error.main,
                borderRadius: "50%",
                width: 90,
                height: 90,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1,
                boxShadow: `0 4px 16px ${theme.palette.error.main}55`,
              }}
            >
              <Icon
                icon="mi:delete"
                fontSize="60px"
                color={theme.palette.error.contrastText}
              />
            </Box>
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: "bold",
                color: theme.palette.error.main,
                letterSpacing: 0.5,
                fontFamily: "Poppins, sans-serif",
                mb: 3,
              }}
            >
              Hapus Data Tiket
            </Typography>
            <Typography
              sx={{
                fontSize: 16,
                textAlign: "center",
                fontWeight: 500,
                fontFamily: "Poppins, sans-serif",
                mb: 1,
              }}
            >
              Tindakan ini tidak dapat di batalkan, Anda yakin ingin menghapus
              tiket dengan nomor{" "}
              <span
                style={{
                  fontWeight: "bold",
                  color: theme.palette.primary.main,
                  //   border: `1px solid ${theme.palette.primary.main}`,
                  //   borderRadius: 4,
                  fontSize: 14,
                }}
              >
                {selectedData && selectedData.ticket_code
                  ? selectedData.ticket_code
                  : ""}
              </span>{" "}
              ?
            </Typography>
          </Box>
          <Button
            onClick={handleSubmit}
            variant="contained"
            fullWidth
            size="small"
            sx={{
              mt: 2,
              fontWeight: "bold",
              fontFamily: "Poppins, sans-serif",
              fontSize: 15,
              textTransform: "none",
              color: "#fff",
              bgcolor: "error.main",
              boxShadow: "0 2px 8px rgba(255,0,0,0.10)",
              borderRadius: 2,
              transition: "background 0.2s, box-shadow 0.2s",
              "&:hover": {
                bgcolor: "error.dark",
                boxShadow: "0 4px 16px rgba(255,0,0,0.18)",
              },
            }}
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={22} color="inherit" /> : null
            }
          >
            {loading ? "Menghapus..." : "Hapus Tiket"}
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
};

export default DeleteTicket;
