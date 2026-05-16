"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  Tabs,
  Tab,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ConfigProvider, Table, theme as antdTheme, Tooltip } from "antd";
import axios from "axios";
import { Icon } from "@iconify/react";
import PageHeader from "@/app/components/page-header/PageHeader";
import FontStyle from "@/app/components/font-style/FontStyle";
import StatusTag from "@/app/components/status-tag/StatusTag";
import LoadingBackdrop from "@/app/components/loading/Backdrop";
import Notification from "@/app/components/notification/Notification";
import CrudFormModal from "@/app/components/crud/CrudFormModal";
import { useUser } from "@/app/utils/useUser";
import {
  removeSpaces,
  validateAuthEmail,
  validateAuthPassword,
  validateFullName,
  validateUsername,
} from "@/app/utils/authValidation";
import {
  sanitizePhoneNumber,
  validatePhoneNumber,
} from "@/app/utils/validationTextField";

const roleTabs = [
  { label: "Semua", value: "all", icon: "mdi:account-group-outline" },
  { label: "User", value: "user", icon: "mdi:account-outline" },
  { label: "Admin", value: "admin", icon: "mdi:shield-account-outline" },
  {
    label: "Superadmin",
    value: "superadmin",
    icon: "mdi:shield-crown-outline",
  },
  { label: "Aktif", value: "active", icon: "mdi:account-check-outline" },
  { label: "Nonaktif", value: "inactive", icon: "mdi:account-off-outline" },
];

const roleColor = {
  user: "blue",
  admin: "gold",
  superadmin: "red",
};

const emptyUserForm = {
  fullName: "",
  username: "",
  email: "",
  phoneNumber: "",
  role: "user",
  isActive: true,
  password: "",
};

const roleOptions = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "superadmin", label: "Superadmin" },
];

const getUserFormValues = (mode, user) =>
  mode === "edit" && user
    ? {
        fullName: user.full_name || "",
        username: user.username || "",
        email: user.email || "",
        phoneNumber: user.phone_number || "",
        role: user.role || "user",
        isActive: Boolean(user.is_active),
        password: "",
      }
    : emptyUserForm;

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
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/users");
      setUsers(res.data.data || []);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Gagal mengambil data user",
        severity: "error",
      });
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const openCreateModal = () => {
    setFormMode("create");
    setSelectedUser(null);
    setFormOpen(true);
  };

  const openEditModal = (user) => {
    setFormMode("edit");
    setSelectedUser(user);
    setFormOpen(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  const handleSubmitUser = async (payload) => {
    setLoading(true);
    try {
      const request =
        formMode === "edit"
          ? axios.patch(`/api/users/${selectedUser.id}`, payload)
          : axios.post("/api/users", payload);

      const res = await request;
      setSnackbar({
        open: true,
        message: res.data.message,
        severity: "success",
      });
      setFormOpen(false);
      await fetchUsers();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Gagal menyimpan akun",
        severity: "error",
      });
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const res = await axios.delete(`/api/users/${selectedUser.id}`);
      setSnackbar({
        open: true,
        message: res.data.message,
        severity: "success",
      });
      setDeleteOpen(false);
      await fetchUsers();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Gagal menghapus akun",
        severity: "error",
      });
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const deleteFormFields = useMemo(
    () => [
      {
        name: "confirmation",
        label: "Ketik HAPUS untuk konfirmasi",
        fullWidth: true,
        sanitize: (value) => String(value ?? "").toUpperCase(),
        helperText: "Aksi ini akan menghapus akun dari sistem.",
      },
    ],
    [],
  );

  const validateDeleteForm = (values) =>
    values.confirmation === "HAPUS"
      ? {}
      : { confirmation: "Ketik HAPUS untuk melanjutkan" };

  const onTableChange = (pagination) => {
    if (pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
    }
  };

  const userFormFields = useMemo(
    () => [
      {
        name: "fullName",
        label: "Nama lengkap",
        fullWidth: true,
      },
      {
        name: "username",
        label: "Username",
        sanitize: removeSpaces,
      },
      {
        name: "email",
        label: "Email",
        sanitize: (value) => removeSpaces(value).toLowerCase(),
      },
      {
        name: "phoneNumber",
        label: "Nomor WhatsApp",
        prefix: "+62",
        sanitize: sanitizePhoneNumber,
        // helperText: "Awali dengan 8, contoh: 82187708266",
      },
      {
        name: "role",
        label: "Role",
        type: "select",
        options: roleOptions,
      },
      {
        name: "password",
        label: formMode === "edit" ? "Password baru (opsional)" : "Password",
        type: "password",
        fullWidth: true,
      },
      {
        name: "isActive",
        label: "Status akun",
        type: "switch",
        helperText: "Akun aktif dapat login dan menggunakan sistem.",
      },
    ],
    [formMode],
  );

  const validateUserForm = (values) => {
    const nextErrors = {
      fullName: validateFullName(values.fullName),
      username: validateUsername(values.username),
      email: validateAuthEmail(values.email),
      phoneNumber: values.phoneNumber
        ? validatePhoneNumber(values.phoneNumber)
        : "Nomor telepon harus diisi",
      password:
        formMode !== "edit" || values.password
          ? validateAuthPassword(values.password)
          : "",
    };

    Object.keys(nextErrors).forEach((key) => {
      if (!nextErrors[key]) delete nextErrors[key];
    });

    return nextErrors;
  };

  const actionButtonSx = {
    minWidth: { xs: 34, sm: 38 },
    width: { xs: 34, sm: 38 },
    height: { xs: 32, sm: 34 },
    p: 0,
    borderRadius: 1.5,
  };

  const columns = [
    {
      title: "No.",
      dataIndex: "id",
      width: 52,
      render: (_, record, index) => (
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1.5,
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(15,23,42,0.04)",
            color: "rgba(15,23,42,0.72)",
          }}
        >
          <FontStyle sx={{ fontSize: 12, fontWeight: 600 }}>
            {index + 1}
          </FontStyle>
        </Box>
      ),
    },
    {
      title: "Nama",
      dataIndex: "full_name",
      width: 220,
      render: (value, record) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.6,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 800,
            }}
          >
            {(value || record.username || "?").charAt(0).toUpperCase()}
          </Box>
          <Box minWidth={0}>
            <Tooltip title={value}>
              <FontStyle
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  maxWidth: 150,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {value || "-"}
              </FontStyle>
            </Tooltip>
            <FontStyle
              sx={{ fontSize: 11, fontWeight: 600, color: "text.disabled" }}
            >
              @{record.username}
            </FontStyle>
          </Box>
        </Stack>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 230,
      render: (value) => (
        <FontStyle sx={{ fontSize: 12, fontWeight: 500 }}>
          {value || "-"}
        </FontStyle>
      ),
    },
    {
      title: "WhatsApp",
      dataIndex: "phone_number",
      width: 150,
      render: (value) => (
        <StatusTag label={value ? `+62 ${value}` : "-"} color="green" />
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      width: 130,
      align: "center",
      render: (value) => (
        <StatusTag label={value || "-"} color={roleColor[value] || "blue"} />
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      width: 120,
      align: "center",
      render: (value) => (
        <StatusTag
          label={value ? "Aktif" : "Nonaktif"}
          color={value ? "green" : "red"}
        />
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: isMobile ? 90 : 110,
      fixed: isMobile ? false : "right",
      align: "center",
      render: (_, record) => {
        const isSelf = Number(record.id) === Number(currentUser?.user?.id);

        return (
          <Stack direction="row" spacing={0.8} justifyContent="center">
            <Button
              size="small"
              variant="contained"
              onClick={() => openEditModal(record)}
              sx={{
                ...actionButtonSx,
                bgcolor: "#0284C7",
                boxShadow: "0 8px 16px rgba(2,132,199,0.22)",
                "&:hover": { bgcolor: "#0369A1" },
              }}
            >
              <Icon fontSize={18} icon="line-md:edit-full-filled" />
            </Button>
            <Button
              size="small"
              variant="contained"
              disabled={isSelf}
              onClick={() => openDeleteModal(record)}
              sx={{
                ...actionButtonSx,
                bgcolor: theme.palette.primary.main,
                boxShadow: "0 8px 16px rgba(230,9,9,0.22)",
                "&:hover": { bgcolor: theme.palette.primary.dark },
              }}
            >
              <Icon fontSize={18} icon="mage:trash-fill" />
            </Button>
          </Stack>
        );
      },
    },
  ];

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

          <Paper
            elevation={2}
            sx={{
              borderRadius: 2.5,
              border: "1px solid rgba(15,23,42,0.10)",
              boxShadow: "0 14px 34px rgba(15,23,42,0.08)",
              overflow: "hidden",
              bgcolor: "#fff",
            }}
          >
            <Box
              sx={{
                p: { xs: 1.4, sm: 1.7, md: 2.2 },
                borderBottom: "1px solid rgba(15,23,42,0.08)",
                background:
                  "linear-gradient(135deg, rgba(230,9,9,0.045) 0%, rgba(255,255,255,1) 58%, rgba(22,163,74,0.055) 100%)",
              }}
            >
              <Stack spacing={1.6}>
                <Stack
                  direction="row"
                  spacing={{ xs: 1.2, sm: 1.6 }}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ minWidth: 0 }}
                  >
                    <Box
                      sx={{
                        width: { xs: 40, sm: 42 },
                        height: { xs: 40, sm: 42 },
                        borderRadius: 1.7,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: alpha(theme.palette.primary.main, 0.09),
                        color: theme.palette.primary.main,
                        flexShrink: 0,
                      }}
                    >
                      <Icon icon="mdi:account-search-outline" fontSize={22} />
                    </Box>
                    <Box minWidth={0}>
                      <FontStyle
                        sx={{
                          fontSize: { xs: 15.5, sm: 16 },
                          fontWeight: 700,
                          letterSpacing: 0,
                          color: "text.primary",
                        }}
                      >
                        Temukan Akun
                      </FontStyle>
                      <FontStyle
                        sx={{
                          mt: 0.2,
                          fontSize: { xs: 11, sm: 11.5 },
                          fontWeight: 700,
                          color: "rgba(35,35,35,0.58)",
                          letterSpacing: 0,
                          lineHeight: 1.45,
                        }}
                      >
                        Cari akun dan saring berdasarkan role atau status akses.
                      </FontStyle>
                    </Box>
                  </Stack>

                  <Button
                    variant="contained"
                    onClick={openCreateModal}
                    startIcon={
                      isMobile ? null : (
                        <Icon icon="mdi:account-plus" fontSize={20} />
                      )
                    }
                    sx={{
                      flexShrink: 0,
                      width: { xs: 40, sm: "auto" },
                      minWidth: { xs: 40, sm: 0 },
                      minHeight: { xs: 40, sm: 40, md: 42 },
                      px: { xs: 0, sm: 1.7, md: 2 },
                      borderRadius: { xs: 1.6, md: 2 },
                      textTransform: "none",
                      fontWeight: 900,
                      fontSize: { xs: 12, sm: 12.5, md: 13 },
                      whiteSpace: "nowrap",
                      boxShadow: "0 10px 22px rgba(230,9,9,0.22)",
                    }}
                  >
                    {isMobile ? (
                      <Icon icon="mdi:account-plus" fontSize={21} />
                    ) : (
                      "Tambah Akun"
                    )}
                  </Button>
                </Stack>

                <TextField
                  size="small"
                  variant="filled"
                  placeholder="Cari nama, username, email, nomor WhatsApp, atau role..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  sx={{
                    width: "100%",
                    maxWidth: { xs: "100%", lg: 680 },
                    "& .MuiFilledInput-root": {
                      minHeight: { xs: 44, sm: 46 },
                      borderRadius: 2,
                      bgcolor: "#fff",
                      border: "1px solid rgba(15,23,42,0.08)",
                      boxShadow: "0 10px 20px rgba(15,23,42,0.04)",
                      alignItems: "center",
                      overflow: "hidden",
                      "&:hover": { bgcolor: "#fff" },
                      "&.Mui-focused": {
                        bgcolor: "#fff",
                        borderColor: alpha(theme.palette.primary.main, 0.35),
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <Icon
                        icon="line-md:search-twotone"
                        fontSize={22}
                        color={theme.palette.primary.main}
                        style={{ marginRight: 8 }}
                      />
                    ),
                  }}
                  inputProps={{
                    sx: {
                      py: 1.05,
                      fontSize: { xs: 12.5, sm: 13.5 },
                      fontWeight: 600,
                      textOverflow: "ellipsis",
                    },
                  }}
                />
              </Stack>
            </Box>

            <Box sx={{ px: { xs: 1.2, md: 1.8 }, pt: { xs: 1, md: 1.4 } }}>
              <Tabs
                value={roleTab}
                onChange={(event, value) => setRoleTab(value)}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                  minHeight: 0,
                  "& .MuiTabs-indicator": { display: "none" },
                  "& .MuiTabs-flexContainer": { gap: { xs: 0.8, sm: 1 } },
                  "& .MuiTab-root": {
                    minHeight: 0,
                    p: 0,
                    textTransform: "none",
                    color: "rgba(35,35,35,0.62)",
                  },
                  "& .Mui-selected": {
                    color: `${theme.palette.primary.main} !important`,
                  },
                }}
              >
                {roleTabs.map((item) => {
                  const active = roleTab === item.value;

                  return (
                    <Tab
                      key={item.value}
                      value={item.value}
                      label={
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{
                            minWidth: { xs: 126, sm: 142 },
                            px: { xs: 1, sm: 1.25 },
                            py: { xs: 0.8, sm: 0.95 },
                            borderRadius: 2,
                            border: `1px solid ${
                              active
                                ? alpha(theme.palette.primary.main, 0.28)
                                : "rgba(15,23,42,0.08)"
                            }`,
                            bgcolor: active
                              ? alpha(theme.palette.primary.main, 0.08)
                              : "#fff",
                            boxShadow: active
                              ? "0 10px 20px rgba(230,9,9,0.10)"
                              : "0 8px 18px rgba(15,23,42,0.035)",
                          }}
                        >
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: 1.4,
                              display: "grid",
                              placeItems: "center",
                              color: active
                                ? theme.palette.primary.main
                                : "rgba(35,35,35,0.54)",
                              bgcolor: active
                                ? alpha(theme.palette.primary.main, 0.11)
                                : "rgba(15,23,42,0.04)",
                              flexShrink: 0,
                            }}
                          >
                            <Icon icon={item.icon} fontSize={16} />
                          </Box>
                          <Box sx={{ minWidth: 0, textAlign: "left" }}>
                            <FontStyle
                              sx={{
                                fontSize: 11.5,
                                fontWeight: 900,
                                letterSpacing: 0,
                                lineHeight: 1.1,
                                color: "inherit",
                              }}
                            >
                              {item.label}
                            </FontStyle>
                            <FontStyle
                              sx={{
                                mt: 0.25,
                                fontSize: 10.5,
                                fontWeight: 600,
                                letterSpacing: 0,
                                color: active
                                  ? theme.palette.primary.main
                                  : "rgba(35,35,35,0.46)",
                              }}
                            >
                              {tabCounts[item.value]} akun
                            </FontStyle>
                          </Box>
                        </Stack>
                      }
                    />
                  );
                })}
              </Tabs>
            </Box>

            <Box
              sx={{
                p: { xs: 1, sm: 1.2, md: 1.8 },
                pt: { xs: 0.75, md: 1.2 },
                "& .ant-table": {
                  borderRadius: "14px !important",
                  overflow: "hidden",
                },
                "& .ant-table-thead > tr > th": {
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "800 !important",
                  fontSize: "12px !important",
                },
                "& .ant-table-tbody > tr > td": {
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "12.5px",
                },
                "& .ant-table-container": {
                  border: "1px solid rgba(15,23,42,0.08)",
                  borderRadius: "14px !important",
                },
                "& .ant-pagination": {
                  marginBottom: "0 !important",
                },
              }}
            >
              <Table
                rowKey="id"
                columns={columns}
                dataSource={filteredUsers}
                loading={loading}
                onChange={onTableChange}
                scroll={{ x: "max-content", y: 520 }}
                locale={{
                  emptyText: (
                    <Box sx={{ py: 4, textAlign: "center" }}>
                      <Icon
                        icon="mdi:account-search-outline"
                        fontSize={42}
                        color="rgba(230,9,9,0.45)"
                      />
                      <FontStyle sx={{ mt: 1, fontSize: 15, fontWeight: 900 }}>
                        Belum ada akun ditemukan
                      </FontStyle>
                      <FontStyle
                        sx={{
                          mt: 0.4,
                          fontSize: 12,
                          fontWeight: 700,
                          color: "rgba(35,35,35,0.58)",
                        }}
                      >
                        Coba ubah kata kunci pencarian atau filter role.
                      </FontStyle>
                    </Box>
                  ),
                }}
                pagination={{
                  pageSize,
                  showSizeChanger: true,
                  pageSizeOptions: [5, 10, 20, 50],
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} dari ${total} data`,
                }}
              />
            </Box>
          </Paper>
        </Stack>
      </ConfigProvider>

      {formOpen && (
        <CrudFormModal
          key={`${formMode}-${selectedUser?.id || "new"}`}
          open={formOpen}
          title={formMode === "edit" ? "Edit Akun" : "Tambah Akun"}
          description={
            formMode === "edit"
              ? "Perbarui informasi akun. Password boleh dikosongkan jika tidak ingin diganti."
              : "Buat akun baru untuk user, admin, atau superadmin."
          }
          icon={formMode === "edit" ? "mdi:account-edit" : "mdi:account-plus"}
          initialValues={getUserFormValues(formMode, selectedUser)}
          fields={userFormFields}
          loading={loading}
          submitText={formMode === "edit" ? "Simpan perubahan" : "Tambah akun"}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmitUser}
          validate={validateUserForm}
        />
      )}

      {deleteOpen && (
        <CrudFormModal
          key={`delete-${selectedUser?.id || "user"}`}
          open={deleteOpen}
          title="Hapus Akun?"
          description={`Akun ${selectedUser?.full_name || selectedUser?.username || ""} akan dihapus permanen dari sistem.`}
          icon="mage:trash-fill"
          initialValues={{ confirmation: "" }}
          fields={deleteFormFields}
          loading={loading}
          submitText="Hapus akun"
          onClose={() => setDeleteOpen(false)}
          onSubmit={handleDeleteUser}
          validate={validateDeleteForm}
        />
      )}

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
