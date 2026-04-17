"use client";
import { Box, Button, Paper, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  Table,
  ConfigProvider,
  theme as antdTheme,
  Input,
  Space,
  Button as AntdButton,
  Tag,
} from "antd";
import moment from "moment";
import { Icon } from "@iconify/react";
import axios from "axios";
import Notification from "@/app/components/notification/Notification";
import LoadingBackdrop from "@/app/components/loading/Backdrop";
import AddTicket from "./AddTicket";

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const theme = useTheme();
  const [searchText, setSearchText] = useState("");
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

  const getDataTickets = async () => {
    try {
      const response = await axios.get("/api/my-tickets/get-my-tickets");
      console.log("tickets", response);
      setTickets(response?.data?.data);
    } catch (error) {
      console.log("error", error);
    }
  };

  const getDataLocations = async () => {
    try {
      const response = await axios.get("/api/locations/get-locations");
      console.log("locations", response);
      setLocations(response?.data?.data);
    } catch (error) {
      console.log("error", error);
    }
  };

  const getDataCategories = async () => {
    try {
      const response = await axios.get("/api/category/get-category");
      console.log("categories", response);
      setCategories(response?.data?.data);
    } catch (error) {
      console.log("error", error);
    }
  };

  const getAllData = async () => {
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
  };

  useEffect(() => {
    getAllData();
  }, []);

  const filteredData = tickets.filter(
    (item) =>
      item.ticket_code?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.ticket_title?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.category_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchText.toLowerCase()),
  );

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

  // Utility untuk filter dinamis
  function generateFilters(data, key) {
    return [...new Set(data.map((item) => item[key]))]
      .filter((val) => val !== undefined && val !== null)
      .map((val) => ({ text: val, value: val }));
  }

  function createOnFilter(key) {
    return (value, record) => record[key] === value;
  }

  const ticketTitleFilters = generateFilters(tickets, "ticket_title");
  const categoryFilters = generateFilters(tickets, "category_name");
  const statusFilters = [
    { text: "Pending", value: "pending" },
    { text: "Proses", value: "proses" },
    { text: "Selesai", value: "selesai" },
    { text: "Ditolak", value: "ditolak" },
  ];

  const columns = [
    {
      title: "Kode Tiket",
      dataIndex: "ticket_code",
      render: (text, record) => (
        <Typography sx={{ fontWeight: "bold", fontSize: "12px" }}>
          {record.ticket_code}
        </Typography>
      ),
      width: 150,
    },
    {
      title: "Subjek Tiket",
      dataIndex: "ticket_title",
      filters: ticketTitleFilters,
      onFilter: createOnFilter("ticket_title"),
      filterSearch: true,
      sorter: (a, b) => a.ticket_title.localeCompare(b.ticket_title),
      sortDirections: ["ascend", "descend"],
      render: (text, record) => (
        <Typography sx={{ fontWeight: "bold", fontSize: "12px" }}>
          {record.ticket_title}
        </Typography>
      ),
      width: 200,
    },
    {
      title: "Kategori",
      dataIndex: "category",
      filters: categoryFilters,
      onFilter: createOnFilter("category"),
      filterSearch: true,
      sorter: (a, b) => a.category.localeCompare(b.category),
      sortDirections: ["ascend", "descend"],
      render: (text, record) => (
        <Typography sx={{ fontWeight: "bold", fontSize: "12px" }}>
          {record.category}
        </Typography>
      ),
      width: 200,
    },
    {
      title: "Status",
      dataIndex: "status",
      filters: statusFilters,
      onFilter: createOnFilter("status"),
      filterSearch: true,
      sorter: (a, b) => a.status.localeCompare(b.status),
      sortDirections: ["ascend", "descend"],
      render: (text, record) => (
        <Typography sx={{ fontWeight: "bold", fontSize: "12px" }}>
          {record.status}
        </Typography>
      ),
      width: 200,
    },
    {
      title: "Actions",
      key: "action",
      align: "center",
      width: 100,
      fixed: "right",
      render: (text, record) => (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            size="small"
            variant={"contained"}
            color="info"
            onClick={() => handleEdit(record)}
            sx={{ minWidth: 0, px: 1 }}
          >
            <Icon icon="line-md:edit" fontSize={18} />
          </Button>
          <Button
            size="small"
            variant={"contained"}
            color="error"
            onClick={() => handleDelete(record)}
            sx={{ minWidth: 0, px: 1 }}
          >
            <Icon icon="line-md:close-circle" fontSize={18} />
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%", height: "100%", minHeight: "100%", p: 2 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
          transition: "all 0.3s",
          mb: 4,
          mt: 4,
        }}
      >
        <Button
          variant={"contained"}
          onClick={() => setOpenAddModal(true)}
          sx={{
            textTransform: "none",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            fontWeight: "bold",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Buat
          <Icon icon="mdi:discussion-plus" fontSize="20px" />
        </Button>
      </Box>

      <ConfigProvider
        theme={{
          algorithm: antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: theme.palette.primary.main, // warna utama (angka aktif, outline, dsb)
            // colorText: theme.palette.text.primary, // warna teks default
            // colorBgContainer: theme.palette.background.default, // background tabel
          },
        }}
      >
        <Paper
          elevation={2}
          sx={{
            p:
              filteredData.length > 0
                ? "10px 15px 0px 15px"
                : "10px 15px 10px 15px",
            width: "100%",
            bgcolor: "background.default",
            overflowX: "auto",
          }}
        >
          <Space.Compact
            style={{ width: 250, marginBottom: 20, marginTop: 10 }}
          >
            <Input
              placeholder="Cari Data..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <AntdButton
              type="primary"
              icon={<Icon icon="line-md:search-twotone" fontSize={20} />}
              onClick={() => {
                /* bisa tambahkan aksi pencarian manual di sini */
              }}
            />
          </Space.Compact>

          <Table
            rowKey="id"
            key={"id"}
            columns={columns}
            dataSource={filteredData}
            onChange={onChange}
            showSorterTooltip={{ target: "sorter-icon" }}
            scroll={{ x: "max-content", y: 420 }}
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
      <AddTicket
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        loadingTrue={() => setLoading(true)}
        loadingFalse={() => setLoading(false)}
        loading={loading}
        getDataTickets={getDataTickets}
        onNotify={(notif) => setSnackbar(notif)}
        locations={locations}
        categories={categories}
      />
      {/* <EditCategory
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        loadingTrue={() => setLoading(true)}
        loadingFalse={() => setLoading(false)}
        loading={loading}
        getDataTickets={getDataTickets}
        onNotify={(notif) => setSnackbar(notif)}
        selectedData={selectedData}
      />
      <DeleteCategory
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        loadingTrue={() => setLoading(true)}
        loadingFalse={() => setLoading(false)}
        loading={loading}
        getDataTickets={getDataTickets}
        onNotify={(notif) => setSnackbar(notif)}
        selectedData={selectedData}
      /> */}
      <LoadingBackdrop message="Loading..." open={loading} />
      {/* Snackbar notification */}
      <Notification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default MyTickets;
