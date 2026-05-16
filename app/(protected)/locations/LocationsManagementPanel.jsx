import FontStyle from "@/app/components/font-style/FontStyle";
import { Icon } from "@iconify/react";
import { Box, Button, Paper, Stack, TextField } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Table, Tooltip } from "antd";

const actionButtonSx = {
  minWidth: { xs: 34, sm: 38 },
  width: { xs: 34, sm: 38 },
  height: { xs: 32, sm: 34 },
  p: 0,
  borderRadius: 1.5,
};

const LocationsManagementPanel = ({
  filteredLocations,
  isMobile,
  loading,
  onCreate,
  onEdit,
  onDelete,
  onTableChange,
  pageSize,
  search,
  setSearch,
  theme,
}) => {
  // Definisi kolom tetap di panel karena renderer tabel sangat spesifik ke UI locations.
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
      title: "Nama Lokasi",
      dataIndex: "location_name",
      width: 260,
      // sorter: (a, b) => a.location_name.localeCompare(b.location_name),
      // sortDirections: ["ascend", "descend"],
      render: (value) => (
        <FontStyle
          sx={{
            fontSize: 12,
            fontWeight: 600,
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {value || "-"}
        </FontStyle>
      ),
    },
    {
      title: "Alamat",
      dataIndex: "address",
      width: 320,
      render: (value) => (
        <FontStyle
          sx={{
            fontSize: 12,
            fontWeight: 500,
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {value || "-"}
        </FontStyle>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: isMobile ? 90 : 110,
      fixed: isMobile ? false : "right",
      align: "center",
      render: (_, record) => (
        <Stack direction="row" spacing={0.8} justifyContent="center">
          <Button
            size="small"
            variant="contained"
            onClick={() => onEdit(record)}
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
            onClick={() => onDelete(record)}
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
      ),
    },
  ];

  return (
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
                <Icon icon="mdi:map-search-outline" fontSize={22} />
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
                  Temukan Lokasi
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
                  Cari lokasi pasar atau alamat yang tersedia di sistem.
                </FontStyle>
              </Box>
            </Stack>

            <Button
              variant="contained"
              onClick={onCreate}
              startIcon={
                isMobile ? null : (
                  <Icon icon="line-md:map-marker-plus-twotone" fontSize={20} />
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
                <Icon icon="line-md:map-marker-plus-twotone" fontSize={21} />
              ) : (
                "Tambah Lokasi"
              )}
            </Button>
          </Stack>

          <TextField
            size="small"
            variant="filled"
            placeholder="Cari nama lokasi atau alamat..."
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

      <Box
        sx={{
          p: { xs: 1, sm: 1.2, md: 1.8 },
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
          dataSource={filteredLocations}
          loading={loading}
          onChange={onTableChange}
          showSorterTooltip={{ target: "sorter-icon" }}
          scroll={{ x: "max-content", y: 520 }}
          locale={{
            emptyText: (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Icon
                  icon="mdi:map-search-outline"
                  fontSize={42}
                  color="rgba(230,9,9,0.45)"
                />
                <FontStyle sx={{ mt: 1, fontSize: 15, fontWeight: 900 }}>
                  Belum ada lokasi ditemukan
                </FontStyle>
                <FontStyle
                  sx={{
                    mt: 0.4,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "rgba(35,35,35,0.58)",
                  }}
                >
                  Coba ubah kata kunci pencarian lokasi atau alamat.
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
  );
};

export default LocationsManagementPanel;
