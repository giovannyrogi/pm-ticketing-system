import AppModal from "@/app/components/modal/AppModal";
import FontStyle from "@/app/components/font-style/FontStyle";
import { Box } from "@mui/material";

const DeleteLocationModal = ({
  open,
  selectedLocation,
  loading,
  onClose,
  onSubmit,
  titleColor,
}) => (
  <AppModal
    open={open}
    title="Hapus Lokasi?"
    description="Tindakan ini tidak dapat dibatalkan setelah diproses."
    icon="mi:delete"
    iconColor="#E60909"
    loading={loading}
    submitText="Hapus lokasi"
    onClose={onClose}
    onSubmit={onSubmit}
    titleColor={titleColor}
  >
    <Box
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
        Anda yakin ingin menghapus lokasi{" "}
        <Box component="span" sx={{ color: "primary.main", fontWeight: 900 }}>
          {selectedLocation?.location_name || "-"}
        </Box>
        ? Data lokasi ini tidak akan tampil lagi sebagai pilihan laporan.
      </FontStyle>
    </Box>
  </AppModal>
);

export default DeleteLocationModal;
