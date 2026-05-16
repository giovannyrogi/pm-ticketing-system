import { Box, useTheme } from "@mui/material";
import axios from "axios";
import AppModal from "@/app/components/modal/AppModal";
import FontStyle from "@/app/components/font-style/FontStyle";

const DeleteTicket = ({
  open,
  onClose,
  loadingTrue,
  loadingFalse,
  loading,
  getAllData,
  onNotify,
  selectedData,
}) => {
  const theme = useTheme();

  const handleSubmit = async () => {
    loadingTrue();
    try {
      const response = await axios.delete(
        `/api/my-tickets/delete-ticket/${selectedData?.id}`,
      );

      if (response?.data.success) {
        onNotify &&
          onNotify({
            open: true,
            message: response.data.message || "Data Tiket berhasil dihapus!",
            severity: "success",
          });
        getAllData?.();
        setTimeout(() => {
          onClose();
          loadingFalse();
        }, 1000);
      } else {
        onNotify &&
          onNotify({
            open: true,
            message: response?.data.message || "Gagal menghapus data Tiket .",
            severity: "error",
          });
      }
    } catch (error) {
      console.error("Error deleting data Tiket :", error);
      onNotify &&
        onNotify({
          open: true,
          message:
            error.response.data.message ||
            "Terjadi error saat menghapus data Tiket .",
          severity: "error",
        });
    }
    setTimeout(() => {
      loadingFalse();
    }, 1000);
  };

  return (
    <AppModal
      open={open}
      title="Hapus Data Tiket"
      titleColor={theme.palette.error.main}
      description="Tindakan ini tidak dapat dibatalkan setelah diproses."
      icon="mi:delete"
      iconColor={theme.palette.error.main}
      loading={loading}
      submitText="Hapus Tiket"
      cancelText="Kembali"
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <Box
        align={"center"}
        sx={{
          gridColumn: "1 / -1",
          p: 1.6,
          borderRadius: 2,
          border: "1px solid rgba(230,9,9,0.18)",
          bgcolor: "rgba(230,9,9,0.045)",
        }}
      >
        <FontStyle
          sx={{
            fontSize: 13,
            fontWeight: 700,
            lineHeight: 1.7,
            color: "rgba(35,35,35,0.68)",
          }}
        >
          Anda yakin ingin menghapus tiket dengan nomor{" "}
          <Box component="span" sx={{ color: "primary.main", fontWeight: 600 }}>
            {selectedData?.ticket_code || "-"}
          </Box>{" "}
          ?
        </FontStyle>
        <FontStyle
          sx={{
            mt: 0.5,
            fontSize: 13,
            fontWeight: 700,
            lineHeight: 1.7,
            color: "rgba(35,35,35,0.68)",
          }}
        >
          Data tiket yang telah dihapus tidak dapat dikembalikan.
        </FontStyle>
      </Box>
    </AppModal>
  );
};

export default DeleteTicket;
