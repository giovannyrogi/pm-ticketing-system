import AppModal from "@/app/components/modal/AppModal";
import FontStyle from "@/app/components/font-style/FontStyle";
import {
  Box,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { getUserFormFields } from "./userFormConfig";

const UserFormModal = ({
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
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const fields = useMemo(() => getUserFormFields(mode), [mode]);
  const isEdit = mode === "edit";

  // Field users dirender di sini agar page hanya mengatur data dan request API.
  const renderTextField = (field) => {
    const isPassword = field.type === "password";
    const isVisible = Boolean(visiblePasswords[field.name]);
    const helperText = errors[field.name] || field.helperText || "";

    return (
      <TextField
        key={field.name}
        select={field.type === "select"}
        variant="filled"
        label={field.label}
        type={isPassword && !isVisible ? "password" : "text"}
        value={values[field.name] ?? ""}
        onChange={(event) => onChange(field, event.target.value)}
        error={Boolean(errors[field.name])}
        helperText={helperText}
        fullWidth
        sx={{
          gridColumn: {
            xs: "1 / -1",
            sm: field.fullWidth ? "1 / -1" : "span 1",
          },
          "& .MuiInputAdornment-root .MuiTypography-root": {
            color: "rgba(15,23,42,0.82)",
            fontWeight: 500,
            fontFamily: "Poppins",
            fontSize: 13,
          },
          "& .MuiFormHelperText-root": {
            ml: 0,
            color: errors[field.name]
              ? theme.palette.error.main
              : "rgba(35,35,35,0.58)",
            fontWeight: 700,
          },
        }}
        InputProps={{
          startAdornment: field.prefix ? (
            <InputAdornment position="start">{field.prefix}</InputAdornment>
          ) : field.startIcon ? (
            <InputAdornment position="start">
              <Icon icon={field.startIcon} fontSize={18} />
            </InputAdornment>
          ) : undefined,
          endAdornment: isPassword ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                edge="end"
                onClick={() =>
                  setVisiblePasswords((prev) => ({
                    ...prev,
                    [field.name]: !prev[field.name],
                  }))
                }
                sx={{ color: theme.palette.primary.main }}
              >
                <Icon
                  icon={isVisible ? "mdi:eye-outline" : "mdi:eye-off-outline"}
                  fontSize={22}
                />
              </IconButton>
            </InputAdornment>
          ) : (
            field.endAdornment
          ),
        }}
      >
        {field.options?.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    );
  };

  // Switch status akun dipisah dari TextField karena struktur UI-nya berbeda.
  const renderSwitchField = (field) => (
    <Box
      key={field.name}
      sx={{
        gridColumn: "1 / -1",
        p: 1.4,
        borderRadius: 2,
        border: "1px solid rgba(15,23,42,0.08)",
        bgcolor: "rgba(15,23,42,0.025)",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <FontStyle sx={{ fontSize: 13, fontWeight: 900 }}>
            {field.label}
          </FontStyle>
          {field.helperText && (
            <FontStyle
              sx={{
                mt: 0.3,
                fontSize: 11.5,
                fontWeight: 700,
                color: "rgba(35,35,35,0.56)",
              }}
            >
              {field.helperText}
            </FontStyle>
          )}
        </Box>
        <Switch
          checked={Boolean(values[field.name])}
          onChange={(event) => onChange(field, event.target.checked)}
        />
      </Stack>
    </Box>
  );

  return (
    <AppModal
      open={open}
      title={isEdit ? "Edit Akun" : "Tambah Akun"}
      description={
        isEdit
          ? "Perbarui informasi akun. Password boleh dikosongkan jika tidak ingin diganti."
          : "Buat akun baru untuk user, admin, atau superadmin."
      }
      icon={isEdit ? "mdi:account-edit" : "mdi:account-plus"}
      loading={loading}
      submitText={isEdit ? "Simpan perubahan" : "Tambah akun"}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      {fields.map((field) =>
        field.type === "switch" ? renderSwitchField(field) : renderTextField(field),
      )}
    </AppModal>
  );
};

export default UserFormModal;
