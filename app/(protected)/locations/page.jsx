"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Stack, useMediaQuery, useTheme } from "@mui/material";
import { ConfigProvider, theme as antdTheme } from "antd";
import axios from "axios";
import PageHeader from "@/app/components/page-header/PageHeader";
import LoadingBackdrop from "@/app/components/loading/Backdrop";
import Notification from "@/app/components/notification/Notification";
import DeleteLocationModal from "./DeleteLocationModal";
import LocationFormModal from "./LocationFormModal";
import LocationsManagementPanel from "./LocationsManagementPanel";
import { emptyLocationForm, getLocationFormValues } from "./constants";
import { validateLocationForm } from "./locationFormConfig";

const Locations = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formValues, setFormValues] = useState(emptyLocationForm);
  const [formErrors, setFormErrors] = useState({});
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Satu helper notifikasi menjaga pesan sukses/error tetap konsisten.
  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Ambil data locations setelah halaman dibuka dan setelah proses CRUD selesai.
  const getLocationsData = useCallback(async () => {
    setLoading(true);

    try {
      const response = await axios.get("/api/locations/get-locations");
      setLocations(response.data.data || []);
    } catch (error) {
      showSnackbar(
        error?.response?.data?.message || "Gagal mengambil data lokasi.",
        "error",
      );
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [showSnackbar]);

  useEffect(() => {
    getLocationsData();
  }, [getLocationsData]);

  // Filter client-side menjaga pencarian terasa cepat tanpa request ulang.
  const filteredLocations = useMemo(() => {
    const keyword = search.toLowerCase();

    return locations.filter(
      (item) =>
        item.location_name?.toLowerCase().includes(keyword) ||
        item.address?.toLowerCase().includes(keyword),
    );
  }, [locations, search]);

  const openCreateModal = () => {
    setFormMode("create");
    setSelectedLocation(null);
    setFormValues(emptyLocationForm);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEditModal = (location) => {
    setFormMode("edit");
    setSelectedLocation(location);
    setFormValues(getLocationFormValues("edit", location));
    setFormErrors({});
    setFormOpen(true);
  };

  const openDeleteModal = (location) => {
    setSelectedLocation(location);
    setDeleteOpen(true);
  };

  const handleLocationFieldChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Payload dan endpoint disamakan dengan alur lama agar backend tidak berubah.
  const submitLocationForm = async () => {
    const nextErrors = validateLocationForm(formValues);
    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const payload = {
        location_name: formValues.locationName,
        address: formValues.address,
      };

      const request =
        formMode === "edit"
          ? axios.put(
              `/api/locations/update-location/${selectedLocation?.id}`,
              payload,
            )
          : axios.post("/api/locations/add-location", payload);

      const response = await request;

      if (response.data.success) {
        showSnackbar(
          response.data.message ||
            (formMode === "edit"
              ? "Lokasi berhasil diubah!"
              : "Lokasi berhasil ditambahkan!"),
          formMode === "edit" ? "info" : "success",
        );
        setFormOpen(false);
        setFormValues(emptyLocationForm);
        await getLocationsData();
      } else {
        showSnackbar(
          response.data.message ||
            (formMode === "edit"
              ? "Gagal mengubah lokasi."
              : "Gagal menambah lokasi."),
          "error",
        );
      }
    } catch (error) {
      showSnackbar(
        error?.response?.data?.message ||
          (formMode === "edit"
            ? "Terjadi error saat mengubah lokasi."
            : "Terjadi error saat menambah lokasi."),
        "error",
      );
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const submitDeleteLocation = async () => {
    if (!selectedLocation?.id) return;

    setLoading(true);
    try {
      const response = await axios.delete(
        `/api/locations/delete-location/${selectedLocation.id}`,
      );

      if (response?.data?.success) {
        showSnackbar(
          response.data?.message || "Lokasi berhasil dihapus!",
          "info",
        );
        setDeleteOpen(false);
        await getLocationsData();
      } else {
        showSnackbar(
          response?.data?.message || "Gagal menghapus lokasi.",
          "error",
        );
      }
    } catch (error) {
      showSnackbar(
        error?.response?.data?.message ||
          "Terjadi error saat menghapus lokasi.",
        "error",
      );
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const onTableChange = (pagination) => {
    if (pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 }, pb: { xs: 3, md: 4 } }}>
      <LoadingBackdrop message="Loading..." open={loading} />
      <ConfigProvider
        theme={{
          algorithm: antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: theme.palette.primary.main,
            borderRadius: 10,
            fontFamily: "Poppins, sans-serif",
          },
          components: {
            Table: {
              headerBg: "#EF0B0B",
              headerColor: "#fff",
              headerSplitColor: "rgba(255,255,255,0.38)",
              rowHoverBg: "rgba(239,11,11,0.035)",
              borderColor: "rgba(15,23,42,0.08)",
            },
          },
        }}
      >
        <Stack spacing={{ xs: 1.4, md: 2.2 }}>
          <PageHeader
            badge="Data Master"
            title="Manajemen Lokasi"
            description="Kelola daftar lokasi pasar dan area layanan yang tersedia untuk laporan PMCare."
            icon="mdi:map-marker-multiple-outline"
            iconColor="#16A34A"
          />

          <LocationsManagementPanel
            filteredLocations={filteredLocations}
            isMobile={isMobile}
            loading={loading}
            onCreate={openCreateModal}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            onTableChange={onTableChange}
            pageSize={pageSize}
            search={search}
            setSearch={setSearch}
            theme={theme}
          />
        </Stack>
      </ConfigProvider>

      <LocationFormModal
        open={formOpen}
        mode={formMode}
        values={formValues}
        errors={formErrors}
        loading={loading}
        theme={theme}
        onClose={() => setFormOpen(false)}
        onChange={handleLocationFieldChange}
        onSubmit={submitLocationForm}
      />

      <DeleteLocationModal
        open={deleteOpen}
        selectedLocation={selectedLocation}
        loading={loading}
        onClose={() => setDeleteOpen(false)}
        onSubmit={submitDeleteLocation}
        titleColor={theme.palette.error.main}
      />

      <Notification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
};

export default Locations;
