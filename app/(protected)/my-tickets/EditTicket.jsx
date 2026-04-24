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

const EditTicket = ({
  open,
  onClose,
  loadingTrue,
  loadingFalse,
  loading,
  getAllData,
  onNotify,
  locations,
  categories,
  selectedData,
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const MAX_SIZE = 3 * 1024 * 1024; // 3MB
  const TITLE_MAX = 50;
  const DESC_MAX = 1000;

  // console.log("selectedData", selectedData);

  // ======================
  // INIT DATA
  // ======================
  useEffect(() => {
    if (open && selectedData) {
      setLocationId(selectedData?.location_id || "");
      setTicketCode(selectedData?.ticket_code || "");
      setTicketTitle(selectedData?.ticket_title || "");
      setTicketDescription(selectedData?.ticket_description || "");
      setCategory(selectedData?.category_id || "");
      setStatus(selectedData?.status || "");
      setSelectedLocationsId(selectedData?.location_id || "");
      setSelectedCategoriesId(selectedData?.category_id || "");

      // FIX IMAGE INIT
      setExistingImages(selectedData?.images || []);
      setNewImages([]);
    }
  }, [open, selectedData]);

  // ======================
  // TOTAL IMAGE
  // ======================
  const totalImages = existingImages.length + newImages.length;

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

    if (totalImages > 3) {
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
      formData.append("ticket_code", tickeCode);

      // NEW IMAGES
      newImages.forEach((file) => {
        formData.append("images", file);
      });

      // EXISTING IMAGES
      formData.append("existing_images", JSON.stringify(existingImages));

      const res = await axios.post("/api/my-tickets/update-ticket", formData);

      if (res?.data?.success) {
        onNotify?.({
          open: true,
          message: "Ticket berhasil diperbarui",
          severity: "success",
        });

        getAllData?.();

        setTimeout(() => {
          setNewImages([]);
          setExistingImages([]);
          onClose?.();
          loadingFalse?.();
        }, 800);
      } else {
        onNotify?.({
          open: true,
          message: res?.data?.message || "Gagal perbarui ticket",
          severity: "error",
        });
        loadingFalse?.();
      }
    } catch (err) {
      console.log("ERROR UPDATE TICKET:", err.response || err);

      onNotify?.({
        open: true,
        message: err?.response?.data?.message || err.message,
        severity: "error",
      });

      loadingFalse?.();
    }
  };

  // ======================
  // HANDLE UPLOAD
  // ======================
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    for (let file of files) {
      if (file.size > MAX_SIZE) {
        onNotify?.({
          open: true,
          message: "Ukuran gambar maksimal 3MB",
          severity: "warning",
        });
        return;
      }
    }

    if (files.length + totalImages > 3) {
      onNotify?.({
        open: true,
        message: "Maksimal 3 gambar",
        severity: "warning",
      });
      return;
    }

    setNewImages((prev) => [...prev, ...files]);

    // reset input
    e.target.value = "";
  };

  // ======================
  // HANDLE REMOVE
  // ======================
  const handleRemoveExisting = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNew = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
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
            Form Ubah Data
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField
                label="Kode Tiket"
                variant="filled"
                fullWidth
                value={tickeCode}
                required
                disabled
                color="primary"
              />
            </Grid>
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
            <Grid size={12} mb={1}>
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
                {/* EXISTING IMAGES */}
                {existingImages.map((src, index) => (
                  <Box
                    key={`old-${index}`}
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
                    <img
                      src={src}
                      onClick={() => handlePreviewImage(src)}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                    />

                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveExisting(index);
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
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 14, color: "#fff" }} />
                    </Box>
                  </Box>
                ))}

                {/* NEW IMAGES */}
                {newImages.map((file, index) => {
                  const src = URL.createObjectURL(file);

                  return (
                    <Box
                      key={`new-${index}`}
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
                      <img
                        src={src}
                        onClick={() => handlePreviewImage(src)}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          cursor: "pointer",
                        }}
                      />

                      <Box
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveNew(index);
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
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 14, color: "#fff" }} />
                      </Box>
                    </Box>
                  );
                })}

                {/* UPLOAD BOX */}
                {totalImages < 3 && (
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
                {loading ? "Loading..." : "Perbarui Ticket"}
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

export default EditTicket;
