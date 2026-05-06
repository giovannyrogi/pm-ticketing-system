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
  Tooltip,
} from "antd";
import moment from "moment";
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

const MyTickets = () => {
  const router = useRouter();
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

  const handleView = (record) => {
    // console.log("record", record);

    router.push(`/ticket-details/${record.id}`);
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
              <FontStyle fontWeight={"500"}>{shortText}</FontStyle>
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
      width: 50,
      fixed: "right",
      render: (text, record) => {
        const isPending = record.status === "pending";

        return (
          <Box display="flex" gap={1} justifyContent="center">
            {/* EDIT hanya pending */}
            {isPending && (
              <Button
                size="small"
                variant="contained"
                color="info"
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
                color="error"
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
            scroll={{ x: "max-content", y: 500 }}
            pagination={{
              pageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: [5, 10, 20, 50],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} data`,
            }}
            // style={{
            //   height: 4,
            // }}
          />
        </Paper>
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
    </Box>
  );
};

export default MyTickets;
