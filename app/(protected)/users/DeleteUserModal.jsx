import AppModal from "@/app/components/modal/AppModal";
import { TextField } from "@mui/material";

const DeleteUserModal = ({
  open,
  selectedUser,
  values,
  errors,
  loading,
  onClose,
  onChange,
  onSubmit,
  theme,
}) => (
  <AppModal
    open={open}
    title="Hapus Akun?"
    description={`Akun ${selectedUser?.full_name || selectedUser?.username || ""} akan dihapus permanen dari sistem.`}
    icon="mage:trash-fill"
    loading={loading}
    submitText="Hapus akun"
    onClose={onClose}
    onSubmit={onSubmit}
  >
    <TextField
      variant="filled"
      label="Ketik HAPUS untuk konfirmasi"
      value={values.confirmation}
      onChange={(event) => onChange(event.target.value)}
      error={Boolean(errors.confirmation)}
      helperText={
        errors.confirmation || "Aksi ini akan menghapus akun dari sistem."
      }
      fullWidth
      sx={{
        gridColumn: "1 / -1",
        "& .MuiFormHelperText-root": {
          ml: 0,
          color: errors.confirmation
            ? theme.palette.error.main
            : "rgba(35,35,35,0.58)",
          fontWeight: 700,
        },
      }}
    />
  </AppModal>
);

export default DeleteUserModal;
