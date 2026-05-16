"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Stack, useMediaQuery, useTheme } from "@mui/material";
import { ConfigProvider, theme as antdTheme } from "antd";
import axios from "axios";
import PageHeader from "@/app/components/page-header/PageHeader";
import LoadingBackdrop from "@/app/components/loading/Backdrop";
import Notification from "@/app/components/notification/Notification";
import CategoriesManagementPanel from "./CategoriesManagementPanel";
import CategoryFormModal from "./CategoryFormModal";
import DeleteCategoryModal from "./DeleteCategoryModal";
import { emptyCategoryForm, getCategoryFormValues } from "./constants";
import { validateCategoryForm } from "./categoryFormConfig";

const Category = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formValues, setFormValues] = useState(emptyCategoryForm);
  const [formErrors, setFormErrors] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
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

  // Ambil ulang data setelah halaman dibuka dan setiap proses CRUD selesai.
  const getCategoriesData = useCallback(async () => {
    setLoading(true);

    try {
      const response = await axios.get("/api/category/get-category");
      setCategories(response.data.data || []);
    } catch (error) {
      showSnackbar(
        error?.response?.data?.message || "Gagal mengambil data kategori.",
        "error",
      );
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [showSnackbar]);

  useEffect(() => {
    getCategoriesData();
  }, [getCategoriesData]);

  // Filter client-side menjaga pencarian tetap cepat tanpa mengubah API lama.
  const filteredCategories = useMemo(() => {
    const keyword = search.toLowerCase();

    return categories.filter((item) =>
      item.category_name?.toLowerCase().includes(keyword),
    );
  }, [categories, search]);

  const openCreateModal = () => {
    setFormMode("create");
    setSelectedCategory(null);
    setFormValues(emptyCategoryForm);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEditModal = (category) => {
    setFormMode("edit");
    setSelectedCategory(category);
    setFormValues(getCategoryFormValues("edit", category));
    setFormErrors({});
    setFormOpen(true);
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setDeleteOpen(true);
  };

  const handleCategoryFieldChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Payload dan endpoint mengikuti alur category lama agar backend tidak berubah.
  const submitCategoryForm = async () => {
    const nextErrors = validateCategoryForm(formValues);
    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const payload = {
        category_name: formValues.categoryName,
      };

      const request =
        formMode === "edit"
          ? axios.put(
              `/api/category/update-category/${selectedCategory?.id}`,
              payload,
            )
          : axios.post("/api/category/add-category", payload);

      const response = await request;

      if (response.data.success) {
        showSnackbar(
          response.data.message ||
            (formMode === "edit"
              ? "Category berhasil diubah!"
              : "Category berhasil ditambahkan!"),
          formMode === "edit" ? "info" : "success",
        );
        setFormOpen(false);
        setFormValues(emptyCategoryForm);
        await getCategoriesData();
      } else {
        showSnackbar(
          response.data.message ||
            (formMode === "edit"
              ? "Gagal mengubah Category."
              : "Gagal menambah Category."),
          "error",
        );
      }
    } catch (error) {
      showSnackbar(
        error?.response?.data?.message ||
          (formMode === "edit"
            ? "Terjadi error saat mengubah Category."
            : "Terjadi error saat menambah Category."),
        "error",
      );
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const submitDeleteCategory = async () => {
    if (!selectedCategory?.id) return;

    setLoading(true);
    try {
      const response = await axios.delete(
        `/api/category/delete-category/${selectedCategory.id}`,
      );

      if (response?.data?.success) {
        showSnackbar(response.data?.message || "Kategori berhasil dihapus!", "info");
        setDeleteOpen(false);
        await getCategoriesData();
      } else {
        showSnackbar(
          response?.data?.message || "Gagal menghapus kategori.",
          "error",
        );
      }
    } catch (error) {
      showSnackbar(
        error?.response?.data?.message ||
          "Terjadi error saat menghapus kategori.",
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
            title="Manajemen Kategori"
            description="Kelola daftar kategori laporan yang tersedia untuk tiket dan publikasi PMCare."
            icon="tabler:category-filled"
            iconColor="#2563EB"
          />

          <CategoriesManagementPanel
            filteredCategories={filteredCategories}
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

      <CategoryFormModal
        open={formOpen}
        mode={formMode}
        values={formValues}
        errors={formErrors}
        loading={loading}
        theme={theme}
        onClose={() => setFormOpen(false)}
        onChange={handleCategoryFieldChange}
        onSubmit={submitCategoryForm}
      />

      <DeleteCategoryModal
        open={deleteOpen}
        selectedCategory={selectedCategory}
        loading={loading}
        onClose={() => setDeleteOpen(false)}
        onSubmit={submitDeleteCategory}
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

export default Category;
