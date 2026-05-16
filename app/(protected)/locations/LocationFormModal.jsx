import AppModal from "@/app/components/modal/AppModal";
import { TextField } from "@mui/material";
import { locationFormFields } from "./locationFormConfig";

const LocationFormModal = ({
  open,
  mode,
  values,
  errors,
  loading,
  onClose,
  onChange,
  onSubmit,
  theme,
}) => {
  const isEdit = mode === "edit";

  return (
    <AppModal
      open={open}
      title={isEdit ? "Edit Lokasi" : "Tambah Lokasi"}
      description={
        isEdit
          ? "Perbarui nama lokasi dan alamat yang tersedia untuk laporan."
          : "Tambahkan lokasi pasar atau area layanan yang dapat dipilih user."
      }
      icon={isEdit ? "hugeicons:maps-editing" : "mdi:map-marker-plus-outline"}
      loading={loading}
      submitText={isEdit ? "Simpan perubahan" : "Tambah lokasi"}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      {locationFormFields.map((field) => (
        <TextField
          key={field.name}
          variant="filled"
          label={field.label}
          placeholder={field.placeholder}
          value={values[field.name] ?? ""}
          onChange={(event) => onChange(field.name, event.target.value)}
          error={Boolean(errors[field.name])}
          helperText={errors[field.name] || ""}
          required
          fullWidth
          sx={{
            gridColumn: "1 / -1",
            "& .MuiFormHelperText-root": {
              ml: 0,
              color: errors[field.name]
                ? theme.palette.error.main
                : "rgba(35,35,35,0.58)",
              fontWeight: 700,
            },
          }}
        />
      ))}
    </AppModal>
  );
};

export default LocationFormModal;
