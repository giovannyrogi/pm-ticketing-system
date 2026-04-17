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

const AddTicket = ({
  open,
  onClose,
  loadingTrue,
  loadingFalse,
  loading,
  getDataTickets,
  onNotify,
  locations,
  categories,
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

  const [tickeCode, setTicketCode] = useState("");
  const [locationId, setLocationId] = useState("");
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [selectedLocationsId, setSelectedLocationsId] = useState("");
  const [selectedLocations, setSelectedLocations] = useState("");
  const [selectedCategoriesId, setSelectedCategoriesId] = useState("");
  const [selectedCategories, setSelectedCategories] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // loadingTrue();

    // try {
    //   const response = await axios.post("/api/category/add-category", {
    //     category_name: categoryName,
    //   });

    //   if (response?.data?.success) {
    //     // Notifikasi sukses
    //     onNotify &&
    //       onNotify({
    //         open: true,
    //         message: response.data.message || "Category berhasil ditambahkan!",
    //         severity: "success",
    //       });
    //     getDataTickets();
    //     setTimeout(() => {
    //       onClose();
    //       loadingFalse();
    //       clearForm();
    //     }, 1000);
    //   } else {
    //     console.log("error", response);
    //     // Notifikasi error
    //     onNotify &&
    //       onNotify({
    //         open: true,
    //         message: response?.data?.message || "Gagal menambah Category.",
    //         severity: "error",
    //       });
    //     setTimeout(() => {
    //       loadingFalse();
    //     }, 1000);
    //   }
    // } catch (error) {
    //   console.log("error", error);
    //   onNotify &&
    //     onNotify({
    //       open: true,
    //       message:
    //         error.response.data.message ||
    //         "Terjadi error saat menambah Category.",
    //       severity: "error",
    //     });
    //   setTimeout(() => {
    //     loadingFalse();
    //   }, 1000);
    // }
  };

  const clearForm = () => {
    setTicketCode("");
    setLocationId("");
    setTicketTitle("");
    setTicketDescription("");
    setCategory("");
    setStatus("");
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
            Form Buat Tiket
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Autocomplete
                options={locations}
                getOptionLabel={(option) => option.location_name || ""}
                value={
                  locations.find((item) => item.id === selectedLocationsId) ||
                  null
                }
                onChange={(event, newValue) => {
                  console.log("newValue", newValue);
                  setSelectedLocationsId(newValue?.id || "");
                  setSelectedLocations(newValue || "");
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Pilih Lokasi"
                    variant="filled"
                    required
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <Autocomplete
                options={categories}
                getOptionLabel={(option) => option.category_name || ""}
                value={
                  categories.find((item) => item.id === selectedCategoriesId) ||
                  null
                }
                onChange={(event, newValue) => {
                  console.log("newValue", newValue);
                  setSelectedCategoriesId(newValue?.id || "");
                  setSelectedCategories(newValue || "");
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Pilih Kategori"
                    variant="filled"
                    required
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Subjek Tiket"
                variant="filled"
                fullWidth
                value={ticketTitle}
                onChange={(e) => setTicketTitle(e.target.value)}
                autoFocus
                required
                disabled={loading}
                color="primary"
              />
            </Grid>
            <Grid size={12}>
              <Grid size={12}>
                <TextField
                  label="Deskripsi Tiket"
                  placeholder="Jelaskan detail keluhan Anda..."
                  variant="filled"
                  fullWidth
                  multiline
                  minRows={4}
                  maxRows={8}
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  required
                  disabled={loading}
                  color="primary"
                  sx={{
                    "& .MuiInputBase-inputMultiline": {
                      paddingTop: "8px", // menghilangkan jarak antara label dan textarea
                      paddingBottom: "8px",
                    },
                  }}
                />
              </Grid>
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
                {loading ? "Loading..." : "Buat Tiket"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Modal>
  );
};

export default AddTicket;
