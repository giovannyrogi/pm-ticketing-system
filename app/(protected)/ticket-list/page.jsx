"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Tabs,
  Tab,
  Paper,
  Stack,
  useTheme,
  Button,
  useMediaQuery,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Table, ConfigProvider, theme as antdTheme, Tooltip } from "antd";
import axios from "axios";
import moment from "moment";
import { useUser } from "@/app/utils/useUser";
import { Icon } from "@iconify/react";
import FontStyle from "@/app/components/font-style/FontStyle";
import StatusTag from "@/app/components/status-tag/StatusTag";
import PageHeader from "@/app/components/page-header/PageHeader";
import { FilterFilled } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const TicketList = () => {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const theme = useTheme();
  const user = useUser();
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [tab, setTab] = useState("all");
  const [dataTabs, setDataTabs] = useState({
    all: [],
    pending: [],
    mine: [],
    mineActive: [],
    others: [],
    proses: [],
    selesai: [],
    ditolak: [],
  });
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  // =========================
  // FETCH DATA
  // =========================
  const getData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/ticket-list/get-ticket-list");
      // console.log("res", res.data);

      setTickets(res.data.data || []);
      setFiltered(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // =========================
  // USER LOGIN ID
  // =========================
  const currentUserId = user?.user?.id;

  // =========================
  // FILTER LOGIC
  // =========================
  useEffect(() => {
    const all = tickets;

    const pending = tickets.filter((t) => !t.assigned_to);
    const mine = tickets.filter(
      (t) => Number(t.assigned_to) === Number(currentUserId),
    );
    const mineActive = mine.filter((t) => t.status === "proses");
    const others = tickets.filter(
      (t) => t.assigned_to && Number(t.assigned_to) !== Number(currentUserId),
    );
    const proses = tickets.filter((t) => t.status === "proses");
    const selesai = tickets.filter((t) => t.status === "selesai");
    const ditolak = tickets.filter((t) => t.status === "ditolak");

    // SET COUNT SEMUA SEKALIGUS
    setDataTabs({
      all,
      pending,
      mine,
      mineActive,
      others,
      proses,
      selesai,
      ditolak,
    });

    // FILTER ACTIVE TAB
    let data = [...tickets];

    switch (tab) {
      case "pending":
        data = pending;
        break;
      case "mine":
        data = mine;
        break;
      case "others":
        data = others;
        break;
      case "proses":
        data = proses;
        break;
      case "selesai":
        data = selesai;
        break;
      case "ditolak":
        data = ditolak;
        break;
      default:
        data = all;
        break;
    }

    // SEARCH
    if (search) {
      const keyword = search.toLowerCase();

      data = data.filter(
        (t) =>
          t.ticket_title?.toLowerCase().includes(keyword) ||
          t.ticket_code?.toLowerCase().includes(keyword) ||
          t.category?.name?.toLowerCase().includes(keyword) ||
          t.status?.toLowerCase().includes(keyword) ||
          t.location?.name?.toLowerCase().includes(keyword) ||
          t.admin?.name?.toLowerCase().includes(keyword),
      );
    }

    setFiltered(data);
  }, [tab, search, tickets, currentUserId]);

  const tabItems = [
    {
      label: "Semua",
      value: "all",
      count: dataTabs.all.length,
      icon: "mdi:view-dashboard-outline",
    },
    {
      label: "Saya Tangani",
      value: "mine",
      count: dataTabs.mine.length,
      icon: "mdi:account-check-outline",
    },
    {
      label: "Admin Lain",
      value: "others",
      count: dataTabs.others.length,
      icon: "mdi:account-multiple-outline",
    },
    {
      label: "Pending",
      value: "pending",
      count: dataTabs.pending.length,
      icon: "mdi:timer-sand",
    },
    {
      label: "Proses",
      value: "proses",
      count: dataTabs.proses.length,
      icon: "mdi:progress-clock",
    },
    {
      label: "Selesai",
      value: "selesai",
      count: dataTabs.selesai.length,
      icon: "mdi:check-circle-outline",
    },
    {
      label: "Ditolak",
      value: "ditolak",
      count: dataTabs.ditolak.length,
      icon: "mdi:close-circle-outline",
    },
  ];

  // =========================
  // TABLE CONFIG
  // =========================
  const onChangePageSize = (pagination, filters, sorter, extra) => {
    if (pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
    }
  };

  function createOnFilter(key) {
    return (value, record) => record[key] === value;
  }

  const statusFilters = [
    { text: "Pending", value: "pending" },
    { text: "Proses", value: "proses" },
    { text: "Selesai", value: "selesai" },
    { text: "Ditolak", value: "ditolak" },
  ];

  const handleView = (record) => {
    // console.log("record", record);

    router.push(`/ticket-details/${record.id}`);
  };

  // =========================
  // TABLE COLUMNS
  // =========================
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
      key: "ticket_code",
      width: 150,
      render: (data) => <StatusTag label={data} color="green" />,
    },
    {
      title: "Subjek Tiket",
      dataIndex: "ticket_title",
      key: "ticket_title",
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
              <FontStyle sx={{ fontSize: 12.5, fontWeight: 600 }}>
                {shortText}
              </FontStyle>
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "Kategori",
      key: "category.name",
      render: (_, data) => {
        const category = data.category?.name || "-";

        return <StatusTag label={category} color={"blue"} />;
      },
      width: 160,
    },
    {
      title: "Lokasi",
      key: "location_name",
      render: (_, data) => {
        return (
          <FontStyle sx={{ fontSize: 12.5, fontWeight: 500 }}>
            {data.location?.name || "-"}
          </FontStyle>
        );
      },
      width: 180,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: statusFilters,
      onFilter: createOnFilter("status"),
      filterSearch: true,
      width: 120,
      align: "center",
      filterIcon: (filtered) => (
        <FilterFilled
          style={{
            color: filtered ? "#ffd666" : "#fff",
            fontSize: 14,
          }}
        />
      ),
      render: (data) => {
        const colorMap = {
          pending: "gold",
          proses: "blue",
          selesai: "green",
          ditolak: "red",
        };

        return <StatusTag label={data} color={colorMap[data]} useRandom />;
      },
    },
    {
      title: "Admin",
      dataIndex: "admin.name",
      key: "admin.name",
      width: 150,
      align: "center",
      render: (_, data) => {
        const adminName = data?.admin?.name;
        const rejectedAdminName = data?.rejected_by_name;
        const status = data?.status;

        return status === "ditolak" ? (
          <StatusTag
            label={rejectedAdminName}
            color={theme.palette.primary.main}
          />
        ) : status === "selesai" || status === "proses" ? (
          <StatusTag label={adminName} color={theme.palette.primary.main} />
        ) : (
          <FontStyle sx={{ fontSize: 12.5, fontWeight: 800 }}>-</FontStyle>
        );
      },
    },
    {
      title: "Tanggal Dibuat",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (data) => {
        return (
          <FontStyle sx={{ fontSize: 12.5, fontWeight: 500 }}>
            {moment(data).locale("id").format("DD MMM YYYY")}
          </FontStyle>
        );
      },
    },
    {
      title: "Aksi",
      key: "action",
      width: 80,
      fixed: isMobile ? false : "right",
      align: "center",
      render: (_, record) => {
        return (
          <Box display="flex" gap={1} justifyContent="center">
            <Button
              size="small"
              variant="contained"
              onClick={() => handleView(record)}
              sx={{
                minWidth: 38,
                width: 38,
                height: 34,
                borderRadius: 1.6,
                bgcolor: theme.palette.primary.main,
                boxShadow: "0 8px 16px rgba(230,9,9,0.22)",
                "&:hover": {
                  bgcolor: theme.palette.primary.dark,
                },
              }}
            >
              <Icon fontSize={18} icon="ant-design:message-outlined" />
            </Button>
            {/* Approve ticket */}
            {/* {isPending && (
              <Button
                size="small"
                variant="contained"
                color="success"
                // onClick={() => handleEdit(record)}
              >
                <Icon
                  fontSize={18}
                  icon="fluent:comment-multiple-checkmark-16-filled"
                />
              </Button>
            )} */}

            {/* Tolak ticket */}
            {/* {isPending && (
              <Button
                size="small"
                variant="contained"
                color="error"
                // onClick={() => handleDelete(record)}
              >
                <Icon fontSize={18} icon="iconamoon:comment-close-fill" />
              </Button>
            )} */}

            {/* VIEW hanya proses & selesai */}
            {/* {!isPending && (
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() => handleView(record)}
              >
                <Icon fontSize={18} icon="ant-design:message-outlined" />
              </Button>
            )} */}
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 }, pb: { xs: 3, md: 4 } }}>
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
            badge="Pusat Tiket"
            title="Daftar Tiket"
            description="Pantau antrean, status penanganan, dan riwayat laporan dalam satu tampilan yang mudah dipindai."
            icon="mdi:clipboard-text-search-outline"
            iconColor="#2563EB"
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
                  "linear-gradient(135deg, rgba(230,9,9,0.045) 0%, rgba(255,255,255,1) 58%, rgba(37,99,235,0.045) 100%)",
              }}
            >
              <Stack
                direction={{ xs: "column", lg: "row" }}
                spacing={{ xs: 1.4, lg: 2 }}
                alignItems={{ xs: "stretch", lg: "center" }}
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={1} alignItems="center">
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
                    <Icon icon="mdi:filter-variant" fontSize={22} />
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
                      Temukan Tiket
                    </FontStyle>
                    <FontStyle
                      sx={{
                        mt: 0.2,
                        fontSize: 12,
                        fontWeight: 700,
                        color: "rgba(35,35,35,0.58)",
                        letterSpacing: 0,
                        lineHeight: 1.45,
                      }}
                    >
                      Gunakan pencarian dan tab status untuk mempersempit
                      daftar.
                    </FontStyle>
                  </Box>
                </Stack>

                <TextField
                  size="small"
                  variant="filled"
                  placeholder="Cari kode, subjek, kategori, lokasi, status, atau nama admin..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{
                    width: { xs: "100%", lg: 560 },
                    "& .MuiFilledInput-root": {
                      minHeight: { xs: 44, sm: 46 },
                      borderRadius: 2,
                      bgcolor: "#fff",
                      border: "1px solid rgba(15,23,42,0.08)",
                      boxShadow: "0 10px 20px rgba(15,23,42,0.04)",
                      alignItems: "center",
                      overflow: "hidden",
                      "&:hover": {
                        bgcolor: "#fff",
                      },
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
              sx={{
                px: { xs: 1.2, md: 1.8 },
                pt: { xs: 1, md: 1.4 },
                pb: { xs: 0.2, md: 0 },
              }}
            >
              {isMobile && (
                <FontStyle
                  sx={{
                    fontSize: 10.5,
                    color: "text.secondary",
                    mb: 0.8,
                    px: 0.2,
                    fontWeight: 700,
                  }}
                >
                  Geser filter ke kiri atau kanan.
                </FontStyle>
              )}
              <Tabs
                value={tab}
                onChange={(e, val) => setTab(val)}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                  minHeight: 0,
                  "& .MuiTabs-indicator": {
                    display: "none",
                  },
                  "& .MuiTabs-flexContainer": {
                    gap: { xs: 0.8, sm: 1 },
                  },
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
                {tabItems.map((item) => {
                  const active = tab === item.value;

                  return (
                    <Tab
                      key={item.value}
                      value={item.value}
                      disableRipple
                      label={
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{
                            px: { xs: 1, sm: 1.25 },
                            py: { xs: 0.8, sm: 0.95 },
                            minWidth: { xs: 126, sm: 142 },
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
                                fontWeight: 700,
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
                              {item.count} tiket
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
                  paddingTop: { xs: "12px !important", md: "14px !important" },
                  paddingBottom: {
                    xs: "12px !important",
                    md: "14px !important",
                  },
                },
                "& .ant-table-tbody > tr > td": {
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "12.5px",
                  paddingTop: { xs: "12px !important", md: "14px !important" },
                  paddingBottom: {
                    xs: "12px !important",
                    md: "14px !important",
                  },
                },
                "& .ant-table-tbody > tr:first-of-type > td": {
                  paddingTop: "10px !important",
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
                columns={columns}
                dataSource={filtered}
                loading={loading}
                onChange={onChangePageSize}
                rowKey="id"
                showSorterTooltip={{ target: "sorter-icon" }}
                scroll={{ x: "max-content", y: 500 }}
                rowClassName={() => "custom-row"}
                locale={{
                  emptyText: (
                    <Box sx={{ py: 4, textAlign: "center" }}>
                      <Icon
                        icon="mdi:ticket-outline"
                        fontSize={42}
                        color="rgba(230,9,9,0.45)"
                      />
                      <FontStyle
                        sx={{
                          mt: 1,
                          fontSize: 15,
                          fontWeight: 900,
                          color: "text.primary",
                        }}
                      >
                        Belum ada tiket ditemukan
                      </FontStyle>
                      <FontStyle
                        sx={{
                          mt: 0.4,
                          fontSize: 12,
                          fontWeight: 700,
                          color: "rgba(35,35,35,0.58)",
                        }}
                      >
                        Coba ubah kata kunci pencarian atau filter yang dipilih.
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
    </Box>
  );
};

export default TicketList;
