"use client";

import {
  Box,
  Button,
  Fade,
  Modal,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Icon } from "@iconify/react";
import FontStyle from "@/app/components/font-style/FontStyle";

const AppModal = ({
  open,
  title,
  titleColor = "text.primary",
  description,
  icon = "mdi:form-select",
  iconColor,
  loading = false,
  submitText = "Simpan",
  cancelText = "Batal",
  children,
  onClose,
  onSubmit,
  maxWidth = 620,
  hideCancel = false,
  hideActions = false,
  submitButtonProps = {},
  cancelButtonProps = {},
  bodySx,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const accentColor = iconColor || theme.palette.primary.main;

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
            width: isMobile ? "92vw" : maxWidth,
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
                  width: 60,
                  height: 60,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: alpha(accentColor, 0.1),
                  color: accentColor,
                  flexShrink: 0,
                }}
              >
                <Icon icon={icon} fontSize={40} />
              </Box>
              <Box minWidth={0}>
                <FontStyle
                  sx={{
                    fontSize: 20,
                    fontWeight: 600,
                    lineHeight: 1.2,
                    color: titleColor,
                  }}
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
              ...bodySx,
            }}
          >
            {children}

            {!hideActions && (
              <Stack
                direction={{ xs: "column-reverse", sm: "row" }}
                spacing={2}
                sx={{ gridColumn: "1 / -1" }}
                mt={2}
              >
                {!hideCancel && (
                  <Button
                    variant="outlined"
                    fullWidth
                    disabled={loading}
                    onClick={onClose}
                    sx={{
                      minHeight: 44,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                    {...cancelButtonProps}
                  >
                    {cancelText}
                  </Button>
                )}
                <Button
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  onClick={onSubmit}
                  sx={{
                    minHeight: 44,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "0 12px 24px rgba(230,9,9,0.22)",
                  }}
                  {...submitButtonProps}
                >
                  {loading ? "Loading..." : submitText}
                </Button>
              </Stack>
            )}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default AppModal;
