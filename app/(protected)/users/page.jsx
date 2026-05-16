"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Stack, useMediaQuery, useTheme } from "@mui/material";
import { ConfigProvider, theme as antdTheme } from "antd";
import axios from "axios";
import PageHeader from "@/app/components/page-header/PageHeader";
import LoadingBackdrop from "@/app/components/loading/Backdrop";
import Notification from "@/app/components/notification/Notification";
import { useUser } from "@/app/utils/useUser";
import DeleteUserModal from "./DeleteUserModal";
import UserFormModal from "./UserFormModal";
import UsersManagementPanel from "./UsersManagementPanel";
import { emptyUserForm, getUserFormValues } from "./constants";
import { validateDeleteForm, validateUserForm } from "./userFormConfig";

const Users = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const currentUser = useUser();
  const [users, setUsers] = useState([]);
  const [roleTab, setRoleTab] = useState("all");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formValues, setFormValues] = useState(emptyUserForm);
  const [formErrors, setFormErrors] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteValues, setDeleteValues] = useState({ confirmation: "" });
  const [deleteErrors, setDeleteErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Satu helper notifikasi menjaga pola snackbar konsisten di semua proses users.
  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Ambil ulang data setelah create, edit, atau delete agar tabel selalu sinkron.
  const fetchUsers = useCallback(async () => {
    setLoading(true);

    try {
      const res = await axios.get("/api/users");
      setUsers(res.data.data || []);
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Gagal mengambil data user",
        "error",
      );
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Hitung jumlah tiap filter tab dari data asli, bukan dari hasil pencarian.
  const tabCounts = useMemo(
    () => ({
      all: users.length,
      user: users.filter((item) => item.role === "user").length,
      admin: users.filter((item) => item.role === "admin").length,
      superadmin: users.filter((item) => item.role === "superadmin").length,
      active: users.filter((item) => item.is_active).length,
      inactive: users.filter((item) => !item.is_active).length,
    }),
    [users],
  );

  // Filter client-side untuk pencarian cepat tanpa request ulang ke backend.
  const filteredUsers = useMemo(() => {
    const keyword = search.toLowerCase();

    return users.filter((item) => {
      const matchesTab =
        roleTab === "all" ||
        item.role === roleTab ||
        (roleTab === "active" && item.is_active) ||
        (roleTab === "inactive" && !item.is_active);

      const matchesSearch =
        item.full_name?.toLowerCase().includes(keyword) ||
        item.username?.toLowerCase().includes(keyword) ||
        item.email?.toLowerCase().includes(keyword) ||
        item.phone_number?.toLowerCase().includes(keyword) ||
        item.role?.toLowerCase().includes(keyword);

      return matchesTab && matchesSearch;
    });
  }, [roleTab, search, users]);

  // Reset state form setiap modal dibuka agar data create/edit tidak saling terbawa.
  const openCreateModal = () => {
    setFormMode("create");
    setSelectedUser(null);
    setFormValues(emptyUserForm);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEditModal = (user) => {
    setFormMode("edit");
    setSelectedUser(user);
    setFormValues(getUserFormValues("edit", user));
    setFormErrors({});
    setFormOpen(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setDeleteValues({ confirmation: "" });
    setDeleteErrors({});
    setDeleteOpen(true);
  };

  const handleUserFieldChange = (field, value) => {
    const nextValue = field.sanitize ? field.sanitize(value, formValues) : value;

    setFormValues((prev) => ({ ...prev, [field.name]: nextValue }));
    setFormErrors((prev) => ({ ...prev, [field.name]: "" }));
  };

  // Validasi tetap dilakukan sebelum request, payload API tidak diubah.
  const submitUserForm = async () => {
    const nextErrors = validateUserForm(formValues, formMode);
    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const request =
        formMode === "edit"
          ? axios.patch(`/api/users/${selectedUser.id}`, formValues)
          : axios.post("/api/users", formValues);

      const res = await request;
      showSnackbar(res.data.message);
      setFormOpen(false);
      await fetchUsers();
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Gagal menyimpan akun",
        "error",
      );
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const handleDeleteConfirmationChange = (value) => {
    setDeleteValues({ confirmation: String(value ?? "").toUpperCase() });
    setDeleteErrors({});
  };

  // Delete dibuat eksplisit memakai konfirmasi HAPUS untuk mengurangi salah klik.
  const submitDeleteForm = async () => {
    if (!selectedUser) return;

    const nextErrors = validateDeleteForm(deleteValues);
    setDeleteErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await axios.delete(`/api/users/${selectedUser.id}`);
      showSnackbar(res.data.message);
      setDeleteOpen(false);
      await fetchUsers();
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Gagal menghapus akun",
        "error",
      );
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const onTableChange = (pagination) => {
    if (pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 }, pb: { xs: 3, md: 4 } }}>
      <LoadingBackdrop open={loading} message="Memproses data akun..." />
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
            title="Manajemen Users"
            description="Kelola akun user, admin, dan superadmin yang dapat mengakses sistem PMCare."
            icon="mdi:account-cog-outline"
            iconColor="#16A34A"
          />

          <UsersManagementPanel
            currentUser={currentUser}
            filteredUsers={filteredUsers}
            isMobile={isMobile}
            loading={loading}
            onCreate={openCreateModal}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            onTableChange={onTableChange}
            pageSize={pageSize}
            roleTab={roleTab}
            search={search}
            setRoleTab={setRoleTab}
            setSearch={setSearch}
            tabCounts={tabCounts}
            theme={theme}
          />
        </Stack>
      </ConfigProvider>

      <UserFormModal
        open={formOpen}
        mode={formMode}
        values={formValues}
        errors={formErrors}
        loading={loading}
        theme={theme}
        onClose={() => setFormOpen(false)}
        onChange={handleUserFieldChange}
        onSubmit={submitUserForm}
      />

      <DeleteUserModal
        open={deleteOpen}
        selectedUser={selectedUser}
        values={deleteValues}
        errors={deleteErrors}
        loading={loading}
        theme={theme}
        onClose={() => setDeleteOpen(false)}
        onChange={handleDeleteConfirmationChange}
        onSubmit={submitDeleteForm}
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

export default Users;
