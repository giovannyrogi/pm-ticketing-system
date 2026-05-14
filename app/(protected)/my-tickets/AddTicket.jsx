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
  useTheme,
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

const AddTicket = ({
  open,
  onClose,
  loadingTrue,
  loadingFalse,
  loading,
  getAllData,
  onNotify,
  locations,
  categories,
  onSuccessCreate,
}) => {
  const theme = useTheme();
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
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const MAX_SIZE = 3 * 1024 * 1024; // 3MB
  const TITLE_MAX = 50;
  const DESC_MAX = 1000;

  const handleSubmit = async (e) => {
    e.preventDefault();
    loadingTrue?.();

    if (!selectedLocationsId) {
      onNotify?.({
        open: true,
        message: "Wajib pilih lokasi",
        severity: "warning",
      });
      return;
    }

    if (!selectedCategoriesId) {
      onNotify?.({
        open: true,
        message: "Wajib pilih kategori",
        severity: "warning",
      });
      return;
    }

    if (!ticketTitle) {
      onNotify?.({
        open: true,
        message: "Wajib isi judul ticket",
        severity: "warning",
      });
      return;
    }

    if (!ticketDescription) {
      onNotify?.({
        open: true,
        message: "Wajib isi deskripsi ticket",
        severity: "warning",
      });
      return;
    }

    if (ticketDescription.length > DESC_MAX) {
      onNotify?.({
        open: true,
        message: "Maksimal 1000 karakter",
        severity: "warning",
      });
      return;
    }

    if (images.length > 3) {
      onNotify?.({
        open: true,
        message: "Maksimal 3 gambar",
        severity: "warning",
      });
      return;
    }

    try {
      // create formdata untuk create ticket
      const formData = new FormData();

      formData.append("location_id", selectedLocationsId);
      formData.append("category_id", selectedCategoriesId);
      formData.append("ticket_title", ticketTitle);
      formData.append("ticket_description", ticketDescription);
      formData.append("user_id", user.id);

      images.forEach((file) => {
        formData.append("images", file);
      });

      const res = await axios.post("/api/my-tickets/create-ticket", formData);

      if (res?.data?.success) {
        onNotify?.({
          open: true,
          message: "Ticket berhasil dibuat",
          severity: "success",
        });

        getAllData?.();

        setTimeout(() => {
          clearForm();

          setImages([]);

          setPreviewImages([]);

          onClose?.();

          onSuccessCreate?.();

          loadingFalse?.();
        }, 800);
      } else {
        onNotify?.({
          open: true,
          message: res?.data?.message || "Gagal membuat ticket",
          severity: "error",
        });
        loadingFalse?.();
      }
    } catch (err) {
      console.log("ERROR CREATE TICKET:", err.response || err);

      onNotify?.({
        open: true,
        message: err?.response?.data?.message || err.message,
        severity: "error",
      });

      loadingFalse?.();
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    for (let file of files) {
      if (file.size > MAX_SIZE) {
        onNotify?.({
          open: true,
          message: "Ukuran gambar maksimal 3MB",
          severity: "error",
        });
        return;
      }
    }

    if (files.length + images.length > 3) {
      onNotify?.({
        open: true,
        message: "Maksimal 3 gambar",
        severity: "error",
      });
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const previews = newImages.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);

    // reset input
    e.target.value = "";
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);

    const previews = newImages.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const clearForm = () => {
    setTicketCode("");
    setLocationId("");
    setTicketTitle("");
    setTicketDescription("");
    setCategory("");
    setStatus("");
    setSelectedLocationsId("");
    setSelectedLocations("");
    setSelectedCategoriesId("");
    setSelectedCategories("");
  };

  const handlePreviewImage = (src) => {
    setSelectedImage(src);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setSelectedImage(null);
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
                  // console.log("newValue", newValue);
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
                  // console.log("newValue", newValue);
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
                placeholder="Masukkan subjek tiket..."
                variant="filled"
                fullWidth
                value={ticketTitle}
                onChange={(e) => {
                  if (e.target.value.length <= TITLE_MAX) {
                    setTicketTitle(e.target.value);
                  }
                }}
                inputProps={{ maxLength: TITLE_MAX }}
                required
                disabled={loading}
                color="primary"
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
                    ticketTitle.length >= TITLE_MAX
                      ? "error.main"
                      : ticketTitle.length >= TITLE_MAX * 0.8
                        ? "warning.main"
                        : "text.disabled",
                }}
              >
                {ticketTitle.length}/{TITLE_MAX}
              </Typography>
            </Grid>
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
                onChange={(e) => {
                  if (e.target.value.length <= DESC_MAX) {
                    setTicketDescription(e.target.value);
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
                    ticketDescription.length >= DESC_MAX
                      ? "error.main"
                      : ticketDescription.length >= DESC_MAX * 0.9
                        ? "warning.main"
                        : "text.disabled",
                }}
              >
                {ticketDescription.length}/{DESC_MAX}
              </Typography>
            </Grid>
            <Grid size={12} mb={2}>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: "bold",
                  color: "text.primary",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                Upload Gambar (Opsional)
              </Typography>
              <Typography
                sx={{
                  fontSize: 10,
                  fontWeight: "bold",
                  fontFamily: "Poppins, sans-serif",
                  mb: 1,
                  color: "error.main",
                }}
              >
                Maksimal 3 gambar, Ukuran 3MB. Format: JPG, PNG.
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  flexWrap: "wrap",
                }}
              >
                {/* PREVIEW IMAGE */}
                {previewImages.map((src, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 85,
                      height: 85,
                      borderRadius: "10px",
                      overflow: "hidden",
                      position: "relative",
                      border: "1px solid #e0e0e0",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
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
                        alt="preview"
                        fill
                        unoptimized
                        style={{
                          objectFit: "cover",
                        }}
                        loading="eager"
                      />
                    </Box>

                    {/* REMOVE BUTTON */}
                    <Box
                      onClick={(e) => {
                        e.stopPropagation(); // Mencegah klik pada gambar penting
                        handleRemoveImage(index);
                      }}
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        bgcolor: "rgba(0,0,0,0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "0.2s",
                        "&:hover": {
                          bgcolor: "error.main",
                        },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 14, color: "#fff" }} />
                    </Box>
                  </Box>
                ))}

                {/* UPLOAD BOX */}
                {images.length < 3 && (
                  <label htmlFor="upload-image">
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
                          transform: "scale(1.05)",

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
                          fontSize: 26,
                          mb: 0.3,
                        }}
                      />

                      <Typography
                        className="upload-text"
                        sx={{
                          fontSize: 10,
                          fontWeight: "bold",
                          fontFamily: "Poppins, sans-serif",
                        }}
                      >
                        Upload
                      </Typography>
                    </Box>
                  </label>
                )}

                {/* INPUT FILE */}
                <input
                  id="upload-image"
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleImageChange}
                />
              </Box>
            </Grid>
            <Grid size={isMobile ? 12 : 6} mt={isMobile ? 0 : 2}>
              <Button
                fullWidth
                variant="contained"
                onClick={onClose}
                disabled={loading}
                sx={{
                  fontWeight: "bold",
                  fontSize: 14,
                  textTransform: "none",
                  borderRadius: 3,
                }}
              >
                Kembali
              </Button>
            </Grid>
            <Grid size={isMobile ? 12 : 6} mt={isMobile ? 0 : 2}>
              <Button
                type="submit"
                variant="contained"
                color="success"
                fullWidth
                sx={{
                  fontWeight: "bold",
                  fontSize: 14,
                  textTransform: "none",
                  borderRadius: 3,
                }}
                disabled={loading}
              >
                {loading ? "Loading..." : "Buat Tiket"}
              </Button>
            </Grid>
          </Grid>
        </form>
        <ImagePreviewModal
          open={previewOpen}
          image={selectedImage}
          onClose={handleClosePreview}
        />
      </Box>
    </Modal>
  );
};

export default AddTicket;
