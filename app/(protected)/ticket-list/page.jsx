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
} from "@mui/material";
import {
  Table,
  ConfigProvider,
  theme as antdTheme,
  Input,
  Space,
  Button as AntdButton,
  Tag,
} from "antd";
import axios from "axios";
import moment from "moment";
import { useUser } from "@/app/utils/useUser";
import { Icon } from "@iconify/react";
import { a } from "framer-motion/client";

const TicketList = () => {
  const theme = useTheme();
  const user = useUser();
  const [tickets, setTickets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

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
  // FILTER LOGIC
  // =========================
  useEffect(() => {
    let data = [...tickets];

    // FILTER TAB
    switch (tab) {
      case "unassigned":
        data = data.filter((t) => !t.assigned_to);
        break;
      case "mine":
        data = data.filter((t) => t.assigned_to === user?.id);
        break;
      case "others":
        data = data.filter((t) => t.assigned_to && t.assigned_to !== user?.id);
        break;
      case "done":
        data = data.filter((t) => t.status === "selesai");
        break;
      default:
        break;
    }

    // SEARCH
    if (search) {
      data = data.filter(
        (t) =>
          t.ticket_title.toLowerCase().includes(search.toLowerCase()) ||
          t.ticket_code.toLowerCase().includes(search.toLowerCase()),
      );
    }

    setFiltered(data);
  }, [tab, search, tickets]);

  // =========================
  // TABLE COLUMNS
  // =========================
  const columns = [
    {
      title: "Kode Tiket",
      dataIndex: "ticket_code",
      key: "ticket_code",
      width: 150,
      render: (code) => (
        <Tag color="green" style={{ fontWeight: 600 }}>
          {code}
        </Tag>
      ),
    },
    {
      title: "Judul Tiket",
      dataIndex: "ticket_title",
      key: "ticket_title",
    },
    {
      title: "Kategori",
      key: "category_name",
      render: (_, row) => {
        const category = row.category?.name || "-";

        return (
          <Tag color="blue" style={{ fontWeight: 600 }}>
            {category}
          </Tag>
        );
      },
      width: 160,
    },
    {
      title: "Lokasi",
      key: "location_name",
      render: (_, row) => row.location?.name || "-",
      width: 160,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const colorMap = {
          pending: "gold",
          proses: "blue",
          selesai: "green",
          ditolak: "red",
        };

        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: "Admin",
      dataIndex: "admin_name",
      key: "admin_name",
      width: 150,
      render: (val) => val || "-",
    },
    {
      title: "Tanggal",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (val) => moment(val).format("DD MMM YYYY"),
    },
    {
      title: "Aksi",
      key: "action",
      width: 80,
      fixed: "right",
      align: "center",
      render: (_, row) => {
        const isPending = row.status === "pending";
        return (
          <Box display="flex" gap={1} justifyContent="center">
            {/* Approve ticket */}
            {isPending && (
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
            )}

            {/* Tolak ticket */}
            {isPending && (
              <Button
                size="small"
                variant="contained"
                color="error"
                // onClick={() => handleDelete(record)}
              >
                <Icon fontSize={18} icon="iconamoon:comment-close-fill" />
              </Button>
            )}

            {/* VIEW hanya proses & selesai */}
            {!isPending && (
              <Button
                size="small"
                variant="contained"
                color="success"
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

  const tableTheme = {
    components: {
      Table: {
        headerBg: "#E60909",
        headerColor: "#fff",
      },
    },
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* =========================
          FILTER TABS
      ========================= */}
      <Tabs
        value={tab}
        onChange={(e, val) => setTab(val)}
        variant="scrollable"
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
        <Tab label="Semua" value="all" />
        <Tab label="Belum di-handle" value="unassigned" />
        <Tab label="Saya handle" value="mine" />
        <Tab label="Admin lain" value="others" />
        <Tab label="Selesai" value="done" />
      </Tabs>

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
        {/* =========================
          SEARCH
        ========================= */}
        <Space.Compact
          style={{ width: "100%", marginBottom: 20, marginTop: 10 }}
        >
          <Input
            placeholder="Cari Data..."
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <AntdButton
            type="primary"
            icon={<Icon icon="line-md:search-twotone" fontSize={20} />}
            onClick={() => {
              /* bisa tambahkan aksi pencarian manual di sini */
            }}
          />
        </Space.Compact>

        <Paper
          elevation={2}
          sx={{
            // p: 2,
            borderRadius: "10px",
          }}
        >
          {/* =========================
          TABLE
      ========================= */}
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            pagination={{ pageSize: 8 }}
            scroll={{ x: true }}
            style={{
              background: "#fff",
              borderRadius: 10,
              overflow: "hidden",
            }}
            rowClassName={() => "custom-row"}
          />
        </Paper>
      </ConfigProvider>
    </Box>
  );
};

export default TicketList;
