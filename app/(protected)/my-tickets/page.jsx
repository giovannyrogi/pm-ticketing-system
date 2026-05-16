"use client";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import React, { useCallback, useEffect, useState } from "react";
import { Table, ConfigProvider, theme as antdTheme, Tooltip } from "antd";
import { Icon } from "@iconify/react";
import axios from "axios";
import Notification from "@/app/components/notification/Notification";
import LoadingBackdrop from "@/app/components/loading/Backdrop";
import AddTicket from "./AddTicket";
import StatusTag from "@/app/components/status-tag/StatusTag";
import EditTicket from "./EditTicket";
import DeleteTicket from "./DeleteTicket";
import FontStyle from "@/app/components/font-style/FontStyle";
import { FilterFilled } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import ActionConfirmationModal from "@/app/components/modal/ActionConfirmationModal";
import PageHeader from "@/app/components/page-header/PageHeader";

const MyTickets = () => {
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [searchText, setSearchText] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [pageSize, setPageSize] = useState(5);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [ticketCreatedModal, setTicketCreatedModal] = useState(false);

  const getDataTickets = useCallback(async () => {
    try {
      const response = await axios.get("/api/my-tickets/get-my-tickets");
      // console.log("tickets", response);
      setTickets(response?.data?.data);
    } catch (error) {
      console.log("error", error);
    }
  }, []);

  const getDataLocations = useCallback(async () => {
    try {
      const response = await axios.get("/api/locations/get-locations");
      // console.log("locations", response);
      setLocations(response?.data?.data);
    } catch (error) {
      console.log("error", error);
    }
  }, []);

  const getDataCategories = useCallback(async () => {
    try {
      const response = await axios.get("/api/category/get-category");
      // console.log("categories", response);
      setCategories(response?.data?.data);
    } catch (error) {
      console.log("error", error);
    }
  }, []);

  const getAllData = useCallback(async () => {
    setLoading(true);
    try {
      await getDataTickets();
      await getDataLocations();
      await getDataCategories();
    } catch (error) {
      console.log("error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [getDataCategories, getDataLocations, getDataTickets]);

  useEffect(() => {
    getAllData();
  }, [getAllData]);

  const statusCounts = {
    all: tickets.length,
    pending: tickets.filter((item) => item.status === "pending").length,
    proses: tickets.filter((item) => item.status === "proses").length,
    selesai: tickets.filter((item) => item.status === "selesai").length,
    ditolak: tickets.filter((item) => item.status === "ditolak").length,
  };

  const statusTabs = [
    {
      label: "Semua",
      value: "all",
      count: statusCounts.all,
      icon: "mdi:view-dashboard-outline",
    },
    {
      label: "Pending",
      value: "pending",
      count: statusCounts.pending,
      icon: "mdi:timer-sand",
    },
    {
      label: "Proses",
      value: "proses",
      count: statusCounts.proses,
      icon: "mdi:progress-clock",
    },
    {
      label: "Selesai",
      value: "selesai",
      count: statusCounts.selesai,
      icon: "mdi:check-circle-outline",
    },
    {
      label: "Ditolak",
      value: "ditolak",
      count: statusCounts.ditolak,
      icon: "mdi:close-circle-outline",
    },
  ];

  const filteredData = tickets.filter((item) => {
    const keyword = searchText.toLowerCase();
    const matchesStatus = statusTab === "all" || item.status === statusTab;
    const matchesSearch =
      item.ticket_code?.toLowerCase().includes(keyword) ||
      item.ticket_title?.toLowerCase().includes(keyword) ||
      item.category_name?.toLowerCase().includes(keyword) ||
      item.status?.toLowerCase().includes(keyword);

    return matchesStatus && matchesSearch;
  });

  const onChange = (pagination, filters, sorter, extra) => {
    if (pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
    }
  };

  const handleEdit = (record) => {
    // console.log("edit record", record);
    setSelectedData(record);
    setOpenEditModal(true);
  };

  const handleDelete = (record) => {
    // console.log("delete record", record);
    setSelectedData(record);
    setOpenDeleteModal(true);
  };

  const handleView = (record) => {
    // console.log("record", record);

    router.push(`/ticket-details/${record.id}`);
  };

  const actionButtonSx = {
    minWidth: { xs: 34, sm: 38 },
    width: { xs: 34, sm: 38 },
    height: { xs: 32, sm: 34 },
    p: 0,
    borderRadius: 1.5,
  };

  // Utility untuk filter dinamis
  function generateFilters(data, key) {
    return [...new Set(data.map((item) => item[key]))]
      .filter((val) => val !== undefined && val !== null)
      .map((val) => ({ text: val, value: val }));
  }

  function createOnFilter(key) {
    return (value, record) => record[key] === value;
  }

  const categoryFilters = generateFilters(tickets, "category_name");
  const statusFilters = [
    { text: "Pending", value: "pending" },
    { text: "Proses", value: "proses" },
    { text: "Selesai", value: "selesai" },
    { text: "Ditolak", value: "ditolak" },
  ];

  const columns = [
    {
      title: "No.",
      dataIndex: "id",
      key: "id",
      width: 50,
      render: (_, data, index) => {
        return (
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
            <FontStyle sx={{ fontSize: 12, fontWeight: 800 }}>
              {index + 1}
            </FontStyle>
          </Box>
        );
      },
    },
    {
      title: "Kode Tiket",
      dataIndex: "ticket_code",
      render: (text, record) => (
        <StatusTag label={record?.ticket_code} color={"green"} />
      ),
      width: 150,
    },
    {
      title: "Subjek Tiket",
      dataIndex: "ticket_title",
      // filters: ticketTitleFilters,
      // onFilter: createOnFilter("ticket_title"),
      // filterSearch: true,
      // sorter: (a, b) => a.ticket_title.localeCompare(b.ticket_title),
      // sortDirections: ["ascend", "descend"],
      render: (data) => {
        const shortText =
          data?.length > 25 ? data.substring(0, 25) + "..." : data;

        return (
          <Tooltip title={data} placement="topLeft" mouseEnterDelay={0.3}>
            <span
              style={{
                cursor: "pointer",
              }}
            >
              <FontStyle sx={{ fontSize: 12, fontWeight: 600 }}>
                {shortText}
              </FontStyle>
            </span>
          </Tooltip>
        );
      },
      width: 200,
    },
    {
      title: "Kategori",
      dataIndex: "category_name",
      filters: categoryFilters,
      onFilter: createOnFilter("category_name"),
      filterSearch: true,
      // sorter: (a, b) => a.category_name.localeCompare(b.category_name),
      // sortDirections: ["ascend", "descend"],
      render: (text, record) => (
        <StatusTag
          label={record?.category_name || "-"}
          color={record?.category_name ? "blue" : "red"}
        />
      ),
      filterIcon: (filtered) => (
        <FilterFilled
          style={{
            color: filtered ? "#ffd666" : "#fff",
            fontSize: 14,
          }}
        />
      ),
      width: 200,
    },
    {
      title: "Status",
      dataIndex: "status",
      filters: statusFilters,
      onFilter: createOnFilter("status"),
      filterSearch: true,
      // sorter: (a, b) => a.status.localeCompare(b.status),
      // sortDirections: ["ascend", "descend"],
      render: (text, record) => <StatusTag label={record?.status} />,
      filterIcon: (filtered) => (
        <FilterFilled
          style={{
            color: filtered ? "#ffd666" : "#fff",
            fontSize: 14,
          }}
        />
      ),
      width: 200,
      align: "center",
    },
    {
      title: "Actions",
      key: "action",
      align: "center",
      width: isMobile ? 52 : 72,
      // fixed: "right",
      render: (text, record) => {
        const isPending = record.status === "pending";

        return (
          <Box
            sx={{
              display: "flex",
              gap: { xs: 0.7, sm: 1 },
              justifyContent: "center",
              alignItems: "center",
              minWidth: { xs: 34, sm: 48 },
              width: "100%",
            }}
          >
            {/* EDIT hanya pending */}
            {isPending && (
              <Button
                size="small"
                variant="contained"
                sx={{
                  ...actionButtonSx,
                  bgcolor: "#0284C7",
                  boxShadow: "0 8px 16px rgba(2,132,199,0.22)",
                  "&:hover": { bgcolor: "#0369A1" },
                }}
                onClick={() => handleEdit(record)}
              >
                <Icon fontSize={18} icon="line-md:edit-full-filled" />
              </Button>
            )}

            {/* DELETE hanya pending */}
            {isPending && (
              <Button
                size="small"
                variant="contained"
                sx={{
                  ...actionButtonSx,
                  bgcolor: theme.palette.primary.main,
                  boxShadow: "0 8px 16px rgba(230,9,9,0.22)",
                  "&:hover": { bgcolor: theme.palette.primary.dark },
                }}
                onClick={() => handleDelete(record)}
              >
                <Icon fontSize={18} icon="mage:trash-fill" />
              </Button>
            )}

            {/* VIEW hanya proses & selesai */}
            {!isPending && (
              <Button
                size="small"
                variant="contained"
                sx={{
                  ...actionButtonSx,
                  bgcolor: theme.palette.primary.main,
                  boxShadow: "0 8px 16px rgba(230,9,9,0.22)",
                  "&:hover": { bgcolor: theme.palette.primary.dark },
                }}
                onClick={() => handleView(record)}
              >
                <Icon fontSize={18} icon="ant-design:message-outlined" />
              </Button>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <Box
      sx={{ width: "100%", minHeight: "100%", p: { xs: 1.5, md: 2 }, pb: 4 }}
    >
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
            badge="Ruang Laporan"
            title="Tiket Saya"
            description="Pantau laporan yang Anda buat, cek status penanganan, dan lanjutkan percakapan dengan admin PMCare."
            icon="mdi:message-text-clock-outline"
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
              <Stack spacing={3}>
                <Stack
                  direction="row"
                  spacing={{ xs: 1.45, sm: 1.6, lg: 2 }}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ minWidth: 0, flex: 1 }}
                  >
                    <Box
                      sx={{
                        width: { xs: 52, sm: 42 },
                        height: { xs: 52, sm: 42 },
                        borderRadius: 1.7,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: alpha(theme.palette.primary.main, 0.09),
                        color: theme.palette.primary.main,
                        flexShrink: 0,
                      }}
                    >
                      <Icon icon="mdi:filter-variant" fontSize={30} />
                    </Box>
                    <Box minWidth={0}>
                      <FontStyle
                        sx={{
                          fontSize: { xs: 15.5, sm: 16 },
                          fontWeight: 600,
                          letterSpacing: 0,
                          color: "text.primary",
                        }}
                      >
                        Temukan Laporan
                      </FontStyle>
                      <FontStyle
                        sx={{
                          mt: 0.2,
                          fontSize: 12,
                          fontWeight: 600,
                          color: "rgba(35,35,35,0.58)",
                          letterSpacing: 0,
                          lineHeight: 1.45,
                        }}
                      >
                        Cari tiket dan filter berdasarkan status laporan Anda.
                      </FontStyle>
                    </Box>
                  </Stack>

                  <Button
                    variant="contained"
                    onClick={() => setOpenAddModal(true)}
                    startIcon={
                      isMobile ? null : (
                        <Icon icon="mdi:discussion-plus" fontSize={20} />
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
                      fontWeight: 800,
                      fontSize: { xs: 12, sm: 12.5, md: 13 },
                      lineHeight: 1,
                      whiteSpace: "nowrap",
                      fontFamily: "Poppins, sans-serif",
                      boxShadow: "0 10px 22px rgba(230,9,9,0.22)",
                      "& .MuiButton-startIcon": {
                        mr: 0.75,
                      },
                    }}
                  >
                    {isMobile ? (
                      <Icon icon="mdi:discussion-plus" fontSize={21} />
                    ) : (
                      "Buat Laporan"
                    )}
                  </Button>
                </Stack>

                <TextField
                  size="small"
                  variant="filled"
                  placeholder="Cari kode, subjek, kategori, atau status..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  sx={{
                    maxWidth: { xs: "100%", lg: 620 },
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

            <Box
              sx={{ px: { xs: 1.2, md: 1.8 }, pt: { xs: 1, md: 1.4 }, mt: 1 }}
            >
              <Stack
                direction="row"
                spacing={{ xs: 0.8, sm: 1 }}
                sx={{
                  overflowX: "auto",
                  pb: 0.4,
                  "&::-webkit-scrollbar": { height: 4 },
                }}
              >
                {statusTabs.map((item) => {
                  const active = statusTab === item.value;

                  return (
                    <Button
                      key={item.value}
                      onClick={() => setStatusTab(item.value)}
                      disableRipple
                      sx={{
                        px: { xs: 1, sm: 1.25 },
                        py: { xs: 0.8, sm: 0.95 },
                        minWidth: { xs: 126, sm: 142 },
                        borderRadius: 2,
                        justifyContent: "flex-start",
                        textTransform: "none",
                        color: active
                          ? theme.palette.primary.main
                          : "rgba(35,35,35,0.62)",
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
                      <Stack direction="row" spacing={1} alignItems="center">
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
                              fontWeight: 800,
                              letterSpacing: 0,
                              color: active
                                ? theme.palette.primary.main
                                : "rgba(35,35,35,0.46)",
                            }}
                          >
                            {item.count} tiket
                          </FontStyle>
                        </Box>
                      </Stack>
                    </Button>
                  );
                })}
              </Stack>
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
                  fontWeight: "600 !important",
                  fontSize: "12px !important",
                  paddingBottom: {
                    xs: "12px !important",
                    md: "14px !important",
                  },
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
                key="id"
                columns={columns}
                dataSource={filteredData}
                loading={loading}
                onChange={onChange}
                showSorterTooltip={{ target: "sorter-icon" }}
                scroll={{ x: "max-content", y: 500 }}
                locale={{
                  emptyText: (
                    <Box sx={{ py: 4, textAlign: "center" }}>
                      <Icon
                        icon="mdi:message-text-outline"
                        fontSize={42}
                        color="rgba(230,9,9,0.45)"
                      />
                      <FontStyle
                        sx={{
                          mt: 1,
                          fontSize: 15,
                          fontWeight: 600,
                          color: "text.primary",
                        }}
                      >
                        Belum ada tiket ditemukan
                      </FontStyle>
                      <FontStyle
                        sx={{
                          mt: 0.4,
                          fontSize: 12,
                          fontWeight: 600,
                          color: "rgba(35,35,35,0.58)",
                        }}
                      >
                        Coba ubah kata kunci pencarian atau filter status.
                      </FontStyle>
                    </Box>
                  ),
                }}
                pagination={{
                  pageSize: pageSize,
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
      <AddTicket
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        loadingTrue={() => setLoading(true)}
        loadingFalse={() => setLoading(false)}
        loading={loading}
        getAllData={getAllData}
        onNotify={(notif) => setSnackbar(notif)}
        locations={locations}
        categories={categories}
        onSuccessCreate={() => setTicketCreatedModal(true)}
      />
      <EditTicket
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        loadingTrue={() => setLoading(true)}
        loadingFalse={() => setLoading(false)}
        loading={loading}
        getAllData={getAllData}
        onNotify={(notif) => setSnackbar(notif)}
        selectedData={selectedData}
        locations={locations}
        categories={categories}
      />
      <DeleteTicket
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        loadingTrue={() => setLoading(true)}
        loadingFalse={() => setLoading(false)}
        loading={loading}
        getAllData={getAllData}
        onNotify={(notif) => setSnackbar(notif)}
        selectedData={selectedData}
      />
      <LoadingBackdrop message="Loading..." open={loading} />
      {/* Snackbar notification */}
      <Notification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />

      <ActionConfirmationModal
        open={ticketCreatedModal}
        onClose={() => setTicketCreatedModal(false)}
        title="Laporan Berhasil Dikirim"
        description="Laporan Anda telah berhasil dibuat dan akan segera diproses oleh tim admin PMCare. Mohon menunggu maksimal 1x24 jam kerja untuk mendapatkan respon atau tindak lanjut."
        icon="material-symbols:task-alt-rounded"
        color="success"
        textColor={theme.palette.success.main}
        confirmText="Mengerti"
        hideCancel={true}
        onConfirm={() => {
          setTicketCreatedModal(false);
        }}
      />
    </Box>
  );
};

export default MyTickets;
