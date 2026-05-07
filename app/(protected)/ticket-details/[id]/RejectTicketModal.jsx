import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextareaAutosize,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import axios from "axios";
import moment from "moment";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloseIcon from "@mui/icons-material/Close";
import { useUser } from "@/app/utils/useUser";
import ImagePreviewModal from "@/app/components/image/ImagePreviewModal";
import Image from "next/image";

const RejectTicketModal = ({
  open,
  onClose,
  setLoading,
  loading,
  onNotify,
  data,
  getDetail,
}) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const user = useUser();

  const style = {
    width: isMobile ? "90vw" : 400,
    maxWidth: "98vw",
    bgcolor: "background.paper",
    color: "text.primary",
    borderRadius: "10px",
    boxShadow: 24,
    p: "18px 20px 18px 20px",
    maxHeight: "90vh",
    overflowY: "auto",
    transition: "box-shadow 0.3s",
    //hide scrollbar
    "&::-webkit-scrollbar": {
      display: "none",
    },
  };

  const [rejectReason, setRejectReason] = useState("");

  const DESC_MAX = 500;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!rejectReason.trim()) {
        onNotify({
          open: true,
          message: "Alasan penolakan wajib diisi",
          severity: "error",
        });

        return;
      }

      setLoading(true);

      const res = await axios.post("/api/tickets/reject-ticket", {
        ticket_id: data?.id,
        rejected_reason: rejectReason,
      });

      if (res.data.success) {
        onNotify({
          open: true,
          message: "Ticket berhasil ditolak",
          severity: "success",
        });

        clearForm();

        onClose();

        await getDetail();
      } else {
        onNotify({
          open: true,
          message: res.data.message || "Terjadi kesalahan",
          severity: "error",
        });
      }
    } catch (err) {
      console.log("ERROR REJECT:", err);

      onNotify({
        open: true,
        message: err?.response?.data?.message || "Terjadi kesalahan server",
        severity: "error",
      });
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const clearForm = () => {
    setRejectReason("");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 0, // hilangkan padding default
      }}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(30,30,30,0.25)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        },
      }}
    >
      <Box sx={style}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            mb: 4,
          }}
        >
          <Typography variant="h6" component="h2" sx={{ fontWeight: "bold" }}>
            Form Penolakan Laporan
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                label="Alasan Penolakan"
                placeholder="Jelaskan detail alasan penolakan laporan ini..."
                variant="filled"
                fullWidth
                multiline
                minRows={4}
                maxRows={8}
                value={rejectReason}
                onChange={(e) => {
                  if (e.target.value.length <= DESC_MAX) {
                    setRejectReason(e.target.value);
                  }
                }}
                inputProps={{ maxLength: DESC_MAX }}
                required
                disabled={loading}
                color="primary"
                sx={{
                  "& .MuiInputBase-inputMultiline": {
                    paddingTop: "8px",
                    paddingBottom: "8px",
                  },
                }}
              />

              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: "bold",
                  fontFamily: "Poppins, sans-serif",
                  textAlign: "right",
                  mt: 0.7,
                  mb: -1.5,
                  color:
                    rejectReason.length >= DESC_MAX
                      ? "error.main"
                      : rejectReason.length >= DESC_MAX * 0.9
                        ? "warning.main"
                        : "text.disabled",
                }}
              >
                {rejectReason.length}/{DESC_MAX}
              </Typography>
            </Grid>

            <Grid size={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{
                  mt: 3,
                  fontWeight: "bold",
                  fontSize: 16,
                  textTransform: "none",
                }}
                disabled={loading}
                startIcon={
                  loading && <CircularProgress size={22} color="inherit" />
                }
              >
                {loading ? "Mengirim..." : "Kirim Penolakan"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Modal>
  );
};

export default RejectTicketModal;
