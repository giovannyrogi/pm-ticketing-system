"use client";

import {
  Box,
  Button,
  Fade,
  IconButton,
  InputAdornment,
  MenuItem,
  Modal,
  Stack,
  Switch,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Icon } from "@iconify/react";
import { useState } from "react";
import FontStyle from "@/app/components/font-style/FontStyle";

const CrudFormModal = ({
  open,
  title,
  description,
  icon = "mdi:form-select",
  iconColor,
  initialValues = {},
  fields = [],
  loading = false,
  submitText = "Simpan",
  cancelText = "Batal",
  onClose,
  onSubmit,
  validate,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const accentColor = iconColor || theme.palette.primary.main;
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const setFieldValue = (field, value) => {
    const nextValue = field.sanitize ? field.sanitize(value, values) : value;

    setValues((prev) => ({ ...prev, [field.name]: nextValue }));
    setErrors((prev) => ({ ...prev, [field.name]: "" }));
  };

  const handleSubmit = () => {
    const nextErrors = validate ? validate(values) : {};
    setErrors(nextErrors || {});

    if (nextErrors && Object.keys(nextErrors).length > 0) return;
    onSubmit(values);
  };

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
        onChange={(event) => setFieldValue(field, event.target.value)}
        error={Boolean(errors[field.name])}
        helperText={helperText}
        fullWidth
        sx={{
          gridColumn: {
            xs: "1 / -1",
            sm: field.fullWidth ? "1 / -1" : "span 1",
          },
          // "& .MuiInputAdornment-root": {
          //   color: "rgba(15,23,42,0.82)",
          //   fontWeight: 500,
          // },
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
                onClick={() =>
                  setVisiblePasswords((prev) => ({
                    ...prev,
                    [field.name]: !prev[field.name],
                  }))
                }
                edge="end"
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
          onChange={(event) => setFieldValue(field, event.target.checked)}
        />
      </Stack>
    </Box>
  );

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      closeAfterTransition
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(30,30,30,0.28)",
          backdropFilter: "blur(6px)",
        },
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobile ? "92vw" : 620,
            maxHeight: "92vh",
            overflowY: "auto",
            bgcolor: "#fff",
            borderRadius: 3,
            boxShadow: "0 24px 70px rgba(15,23,42,0.20)",
            outline: "none",
          }}
        >
          <Box
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderBottom: "1px solid rgba(15,23,42,0.08)",
              background:
                "linear-gradient(135deg, rgba(230,9,9,0.08) 0%, rgba(255,255,255,1) 60%, rgba(37,99,235,0.06) 100%)",
            }}
          >
            <Stack direction="row" spacing={1.4} alignItems="center">
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: alpha(accentColor, 0.1),
                  color: accentColor,
                  flexShrink: 0,
                }}
              >
                <Icon icon={icon} fontSize={28} />
              </Box>
              <Box minWidth={0}>
                <FontStyle
                  sx={{ fontSize: 20, fontWeight: 600, lineHeight: 1.2 }}
                >
                  {title}
                </FontStyle>
                {description && (
                  <FontStyle
                    sx={{
                      mt: 0.4,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "rgba(35,35,35,0.58)",
                      lineHeight: 1.5,
                    }}
                  >
                    {description}
                  </FontStyle>
                )}
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              p: { xs: 2, sm: 2.5 },
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {fields.map((field) =>
              field.type === "switch"
                ? renderSwitchField(field)
                : renderTextField(field),
            )}

            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              spacing={1.2}
              sx={{ gridColumn: "1 / -1" }}
            >
              <Button
                variant="outlined"
                fullWidth
                disabled={loading}
                onClick={onClose}
                sx={{
                  minHeight: 44,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 800,
                }}
              >
                {cancelText}
              </Button>
              <Button
                variant="contained"
                fullWidth
                disabled={loading}
                onClick={handleSubmit}
                sx={{
                  minHeight: 44,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 900,
                  boxShadow: "0 12px 24px rgba(230,9,9,0.22)",
                }}
              >
                {submitText}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default CrudFormModal;
