import AppModal from "@/app/components/modal/AppModal";
import { TextField } from "@mui/material";
import { categoryFormFields } from "./categoryFormConfig";

const CategoryFormModal = ({
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
      title={isEdit ? "Edit Kategori" : "Tambah Kategori"}
      description={
        isEdit
          ? "Perbarui nama kategori laporan yang tersedia untuk tiket."
          : "Tambahkan kategori laporan agar user dapat memilih jenis pengaduan."
      }
      icon={isEdit ? "tabler:category-2" : "mdi:shape-square-plus"}
      loading={loading}
      submitText={isEdit ? "Simpan perubahan" : "Tambah kategori"}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      {categoryFormFields.map((field) => (
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

export default CategoryFormModal;
