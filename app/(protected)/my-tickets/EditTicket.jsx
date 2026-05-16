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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const MAX_SIZE = 3 * 1024 * 1024; // 3MB
  const TITLE_MAX = 50;
  const DESC_MAX = 1000;

  // ======================
  // INIT DATA
  // ======================
  useEffect(() => {
    if (open && selectedData) {
      // Modal edit perlu menyalin snapshot tiket terpilih ke form lokal saat dibuka.
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

    if (totalImages > 3) {
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

  const newImagePreviews = useMemo(
    () =>
      newImages.map((file, index) => ({
        key: `new-${index}-${file.name}`,
        src: URL.createObjectURL(file),
        type: "new",
        index,
      })),
    [newImages],
  );

  useEffect(
    () => () => {
      newImagePreviews.forEach((item) => URL.revokeObjectURL(item.src));
    },
    [newImagePreviews],
  );

  const uploadedImages = useMemo(
    () => [
      ...existingImages.map((src, index) => ({
        key: `old-${index}`,
        src,
        type: "existing",
        index,
      })),
      ...newImagePreviews,
    ],
    [existingImages, newImagePreviews],
  );

  return (
    <AppModal
      open={open}
      title="Ubah Data Tiket"
      description="Perbarui informasi tiket dan lampiran gambar yang masih relevan."
      icon="line-md:edit-full-filled"
      loading={loading}
      submitText="Perbarui Tiket"
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
            uploadId="upload-ticket-image-edit"
            images={uploadedImages}
            onChange={handleImageChange}
            onPreview={handlePreviewImage}
            onRemove={(item) =>
              item.type === "existing"
                ? handleRemoveExisting(item.index)
                : handleRemoveNew(item.index)
            }
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

export default EditTicket;
