import FontStyle from "@/app/components/font-style/FontStyle";
import {
  Box,
  Button,
  Fade,
  Modal,
  Stack,
  TextField,
  IconButton,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useState } from "react";

const AccountFormModal = ({
  open,
  onClose,
  title,
  description,
  icon,
  fields,
  values,
  onChange,
  onSubmit,
  loading,
  submitLabel,
  color,
  tone,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const actionColor = color || theme.palette.primary.main;
  const actionTone = tone || "rgba(230,9,9,0.10)";
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const togglePasswordVisibility = (name) => {
    setVisiblePasswords((current) => ({
      ...current,
      [name]: !current[name],
    }));
  };

  return (
    <Modal open={open} onClose={loading ? null : onClose} closeAfterTransition>
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobile ? "92vw" : 460,
            maxWidth: "95vw",
            bgcolor: "background.paper",
            borderRadius: 3,
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.14)",
            p: { xs: 2.4, md: 3.2 },
            outline: "none",
          }}
        >
          <Stack spacing={2.4}>
            <Stack direction="row" spacing={1.4} alignItems="center">
              <Box
                sx={{
                  width: 68,
                  height: 68,
                  borderRadius: 2.5,
                  display: "grid",
                  placeItems: "center",
                  color: actionColor,
                  bgcolor: actionTone,
                  flexShrink: 0,
                }}
              >
                <Icon icon={icon} fontSize={48} />
              </Box>
              <Box>
                <FontStyle
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "text.primary",
                    letterSpacing: 0,
                  }}
                >
                  {title}
                </FontStyle>
                <FontStyle
                  sx={{
                    mt: 0.4,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "text.disabled",
                    lineHeight: 1.6,
                    letterSpacing: 0,
                  }}
                >
                  {description}
                </FontStyle>
              </Box>
            </Stack>

            <Stack spacing={1.7}>
              {fields.map((field) => (
                <TextField
                  key={field.name}
                  fullWidth
                  variant="standard"
                  label={field.label}
                  type={
                    field.type === "password" && visiblePasswords[field.name]
                      ? "text"
                      : field.type || "text"
                  }
                  value={values[field.name] || ""}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  autoComplete={field.autoComplete}
                  placeholder={field.placeholder}
                  InputProps={{
                    startAdornment: field.startAdornment ? (
                      <InputAdornment position="start">
                        {field.startAdornment}
                      </InputAdornment>
                    ) : undefined,
                    endAdornment:
                      field.type === "password" ? (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={
                              visiblePasswords[field.name]
                                ? "Sembunyikan password"
                                : "Tampilkan password"
                            }
                            onClick={() => togglePasswordVisibility(field.name)}
                            edge="end"
                            sx={{
                              color: actionColor,
                              mr: -0.4,
                            }}
                          >
                            <Icon
                              icon={
                                visiblePasswords[field.name]
                                  ? "mdi:eye-off-outline"
                                  : "mdi:eye-outline"
                              }
                              fontSize={22}
                            />
                          </IconButton>
                        </InputAdornment>
                      ) : undefined,
                  }}
                  sx={{
                    bgcolor: "#f5f6f8",
                    px: 1.6,
                    pt: 0.9,
                    pb: 0.4,
                    borderRadius: "4px 4px 0 0",
                    "& .MuiInputBase-root": {
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 500,
                      fontSize: 15,
                    },
                    "& .MuiInputBase-input": {
                      py: 0.8,
                      pl: 0,
                    },
                    "& .MuiInputAdornment-positionStart": {
                      alignSelf: "flex-end",
                      mb: 0.55,
                      ml: 1.5,
                      mr: 1,
                    },
                    "& .MuiInputAdornment-positionEnd": {
                      alignSelf: "flex-end",
                      mb: 0.2,
                    },
                    "& .MuiInput-underline:before": {
                      borderBottomColor: "rgba(0,0,0,0.24)",
                    },
                    "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                      borderBottomColor: actionColor,
                    },
                    "& .MuiInput-underline:after": {
                      borderBottomColor: actionColor,
                    },
                    "& .MuiInputLabel-root": {
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 500,
                      left: 12,
                      top: 8,
                      "&.Mui-focused": {
                        color: actionColor,
                      },
                    },
                    "& .MuiInputLabel-shrink": {
                      transform: "translate(0, -2px) scale(0.75)",
                    },
                  }}
                />
              ))}
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button
                fullWidth
                variant="outlined"
                onClick={onClose}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 600,
                  textTransform: "none",
                  color: actionColor,
                  borderColor: `${actionColor}55`,
                  "&:hover": {
                    borderColor: actionColor,
                    bgcolor: actionTone,
                  },
                }}
              >
                Batal
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={onSubmit}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 600,
                  textTransform: "none",
                  bgcolor: actionColor,
                  "&:hover": {
                    bgcolor: actionColor,
                    filter: "brightness(0.95)",
                  },
                }}
              >
                {loading ? "Memproses..." : submitLabel}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
};

export default AccountFormModal;
