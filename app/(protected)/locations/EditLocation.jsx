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
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import moment from "moment";
import axios from "axios";

const EditLocation = ({
  open,
  onClose,
  loadingTrue,
  loadingFalse,
  loading,
  getLocationsData,
  onNotify,
  selectedData,
}) => {
  const isMobile = useMediaQuery("(max-width:600px)");

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

  const [locatioName, setLocatioName] = useState("");
  const [address, setAddress] = useState("");

  // Setiap kali selectedData atau open berubah, update form
  useEffect(() => {
    if (open) {
      setLocatioName(selectedData?.location_name || "");
      setAddress(selectedData?.address || "");
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // console.log("activeUntilISO", activeUntilISO);

    loadingTrue();
    try {
      const response = await axios.put(
        `/api/locations/update-location/${selectedData?.id}`,
        {
          location_name: locatioName,
          address: address,
        },
      );
      // console.log("response update", response);

      if (response.data.success) {
        onNotify &&
          onNotify({
            open: true,
            message: response.data.message || "Lokasi berhasil diubah!",
            severity: "info",
          });
        getLocationsData();
        setTimeout(() => {
          onClose();
          loadingFalse();
        }, 1000);
      } else {
        onNotify &&
          onNotify({
            open: true,
            message: response.data.message || "Gagal mengubah lokasi.",
            severity: "error",
          });
        setTimeout(() => {
          loadingFalse();
        }, 1000);
      }
    } catch (error) {
      onNotify &&
        onNotify({
          open: true,
          message:
            error.response.data.message ||
            "Terjadi error saat mengubah lokasi.",
          severity: "error",
        });
      setTimeout(() => {
        loadingFalse();
      }, 1000);
    }
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
            mb: 2,
          }}
        >
          <Typography variant="h6" component="h2" sx={{ fontWeight: "bold" }}>
            Form Ubah Lokasi
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={isMobile ? 3 : 2}>
            <Grid size={12}>
              <TextField
                label="Nama Lokasi"
                variant="filled"
                fullWidth
                value={locatioName}
                onChange={(e) => setLocatioName(e.target.value)}
                autoFocus
                required
                disabled={loading}
                color="primary"
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Nama Jalan"
                variant="filled"
                fullWidth
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                autoFocus
                required
                disabled={loading}
                color="primary"
              />
            </Grid>
            <Grid size={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{
                  mt: 2,
                  fontWeight: "bold",
                  fontSize: 16,
                  textTransform: "none",
                }}
                disabled={loading}
              >
                {loading ? "Mengirim..." : "Submit Data"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Modal>
  );
};

export default EditLocation;
