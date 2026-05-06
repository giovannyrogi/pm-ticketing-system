"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Tabs,
  Tab,
  Chip,
  Paper,
  useTheme,
  Button,
  useMediaQuery,
} from "@mui/material";
import {
  Table,
  ConfigProvider,
  theme as antdTheme,
  Input,
  Space,
  Button as AntdButton,
  Tag,
  Typography,
  Tooltip,
} from "antd";
import axios from "axios";
import moment from "moment";
import { useUser } from "@/app/utils/useUser";
import { Icon } from "@iconify/react";
import FontStyle from "@/app/components/font-style/FontStyle";
import StatusTag from "@/app/components/status-tag/StatusTag";
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
    others: [],
    proses: [],
    selesai: [],
    ditolak: [],
  });
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);

  // =========================
  // FETCH DATA
  // =========================
  const getData = async () => {
    try {
      const res = await axios.get("/api/ticket-list/get-ticket-list");
      console.log("res", res.data);

      setTickets(res.data.data || []);
      setFiltered(res.data.data || []);
    } catch (err) {
      console.error(err);
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
    const mine = tickets.filter((t) => t.assigned_to === currentUserId);
    const others = tickets.filter(
      (t) => t.assigned_to && t.assigned_to !== currentUserId,
    );
    const proses = tickets.filter((t) => t.status === "proses");
    const selesai = tickets.filter((t) => t.status === "selesai");
    const ditolak = tickets.filter((t) => t.status === "ditolak");

    // SET COUNT SEMUA SEKALIGUS
    setDataTabs({
      all,
      pending,
      mine,
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
      data = data.filter(
        (t) =>
          t.ticket_title.toLowerCase().includes(search.toLowerCase()) ||
          t.ticket_code.toLowerCase().includes(search.toLowerCase()) ||
          t.category.name.toLowerCase().includes(search.toLowerCase()) ||
          t.status.toLowerCase().includes(search.toLowerCase()) ||
          t.location?.name.toLowerCase().includes(search.toLowerCase()) ||
          t.admin?.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    setFiltered(data);
  }, [tab, search, tickets]);

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
        return <FontStyle fontWeight={"500"}>{index + 1}</FontStyle>;
      },
    },
    {
      title: "Kode Tiket",
      dataIndex: "ticket_code",
      key: "ticket_code",
      width: 150,
      render: (data) => <StatusTag label={data} color={"green"} />,
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
              <FontStyle fontWeight={"500"}>{shortText}</FontStyle>
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

        return (
          <StatusTag label={category} color={'blue'} />
        );
      },
      width: 160,
    },
    {
      title: "Lokasi",
      key: "location_name",
      render: (_, data) => {
        return (
          <FontStyle fontWeight={"500"}>{data.location?.name || "-"}</FontStyle>
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

        return adminName ? (
          <StatusTag label={adminName} color={theme.palette.primary.main} />
        ) : (
          <FontStyle fontWeight={"500"}>-</FontStyle>
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
          <FontStyle fontWeight={"500"}>
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
        const isPending = record.status === "pending";
        return (
          <Box display="flex" gap={1} justifyContent="center">
            <Button
              size="small"
              variant="contained"
              color="info"
              onClick={() => handleView(record)}
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
    <Box sx={{ p: 2 }}>
      <ConfigProvider
        theme={{
          algorithm: antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: theme.palette.primary.main,
          },

          components: {
            Table: {
              headerBg: theme.palette.primary.main,
              headerColor: "#fff",
              headerSplitColor: "#fff",

              rowHoverBg: "#f5faff",

              // borderRadius: 10,
            },
          },
        }}
      >
        <Paper
          elevation={2}
          sx={{
            p: "10px",
            borderRadius: "10px",
          }}
        >
          {/* =========================
          FILTER TABS
          ========================= */}
          {isMobile && (
            <Box
              sx={{
                fontSize: 11,
                color: "text.secondary",
                mb: 1,
                px: 1,
              }}
            >
              Geser ke kiri / kanan untuk melihat kategori →
            </Box>
          )}

          <Tabs
            value={tab}
            onChange={(e, val) => setTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              mb: 2,

              "& .MuiTabs-indicator": {
                backgroundColor: "primary.main !important",
                height: 3,
                borderRadius: 2,
              },

              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: 13,
                color: "text.disabled",
                borderRadius: "8px",
                mx: 0.5,
                transition: "0.2s",

                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              },

              "& .Mui-selected": {
                color: "primary.main !important",
                backgroundColor: "rgba(25,118,210,0.08)",
              },
            }}
          >
            <Tab label={`Semua (${dataTabs.all.length})`} value="all" />

            <Tab
              label={`Saya Tangani (${dataTabs.mine.length})`}
              value="mine"
            />

            <Tab
              label={`Admin Lain (${dataTabs.others.length})`}
              value="others"
            />

            <Tab
              label={`Pending (${dataTabs.pending.length})`}
              value="pending"
            />

            <Tab label={`Proses (${dataTabs.proses.length})`} value="proses" />

            <Tab
              label={`Selesai (${dataTabs.selesai.length})`}
              value="selesai"
            />

            <Tab
              label={`Ditolak (${dataTabs.ditolak.length})`}
              value="ditolak"
            />
          </Tabs>

          {/* =========================
          SEARCH
          ========================= */}
          <Space.Compact
            style={{
              width: "100%",
              marginBottom: 30,
              marginTop: 20,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Input
              placeholder="Cari data disini..."
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "8px 12px" }}
            />
            <AntdButton
              type="primary"
              icon={<Icon icon="line-md:search-twotone" fontSize={20} />}
              style={{ padding: "19px" }}
            />
          </Space.Compact>

          {/* =========================
          TABLE
          ========================= */}
          <Table
            columns={columns}
            dataSource={filtered}
            onChange={onChangePageSize}
            rowKey="id"
            showSorterTooltip={{ target: "sorter-icon" }}
            scroll={{ x: "max-content", y: 500 }}
            style={{
              background: "#fff",
              borderRadius: 10,
              overflow: "hidden",
            }}
            rowClassName={() => "custom-row"}
            pagination={{
              pageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: [5, 10, 20, 50],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} data`,
            }}
          />
        </Paper>
      </ConfigProvider>
    </Box>
  );
};

export default TicketList;
