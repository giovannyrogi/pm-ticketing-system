import {
  Autocomplete,
  Grid,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useUser } from "@/app/utils/useUser";
import ImagePreviewModal from "@/app/components/image/ImagePreviewModal";
import AppModal from "@/app/components/modal/AppModal";
import TicketImageUpload from "./TicketImageUpload";

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
  const user = useUser();

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

  const handleSubmit = async () => {
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

    loadingTrue?.();

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

  useEffect(
    () => () => {
      previewImages.forEach((src) => URL.revokeObjectURL(src));
    },
    [previewImages],
  );

  const uploadImages = useMemo(
    () =>
      previewImages.map((src, index) => ({
        key: `new-${index}`,
        src,
        index,
      })),
    [previewImages],
  );

  return (
    <AppModal
      open={open}
      title="Buat Tiket"
      description="Lengkapi lokasi, kategori, subjek, deskripsi, dan lampiran bila diperlukan."
      icon="mdi:message-plus"
      loading={loading}
      submitText="Buat Tiket"
      cancelText="Kembali"
      onClose={onClose}
      onSubmit={handleSubmit}
      maxWidth={560}
      bodySx={{
        gridTemplateColumns: "1fr",
        gap: 2.2,
      }}
    >
      <Grid container spacing={2.2} sx={{ gridColumn: "1 / -1" }}>
        <Grid size={12}>
          <Autocomplete
            options={locations}
            getOptionLabel={(option) => option.location_name || ""}
            value={
              locations.find((item) => item.id === selectedLocationsId) || null
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
          <TicketImageUpload
            uploadId="upload-ticket-image-create"
            images={uploadImages}
            onChange={handleImageChange}
            onPreview={handlePreviewImage}
            onRemove={(item) => handleRemoveImage(item.index)}
            theme={theme}
          />
        </Grid>
      </Grid>
      <ImagePreviewModal
        open={previewOpen}
        image={selectedImage}
        onClose={handleClosePreview}
      />
    </AppModal>
  );
};

export default AddTicket;
