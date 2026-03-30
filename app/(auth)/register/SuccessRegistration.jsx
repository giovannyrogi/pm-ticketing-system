import {
  alpha,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Fade,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";

const SuccessRegistration = ({
  open,
  onClose,
  dataUser,
  loading,
  setLoadingTrue,
  loadingFalse,
  redirecting,
  setRedirectingTrue
}) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const theme = useTheme();

  console.log("dataUser", dataUser);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isMobile ? "90vw" : 400,
    maxWidth: "95vw",
    bgcolor: "background.paper",
    color: "text.primary",
    borderRadius: "16px",
    boxShadow: 24,
    p: isMobile ? 2 : "24px 32px 24px 32px",
    outline: "none",
    transition: "box-shadow 0.3s",
  };

  return (
    <Modal
      open={open}
      //   onClose={onClose}
      closeAfterTransition
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(30,30,30,0.25)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        },
      }}
    >
      <Fade in={open}>
        <Box sx={style}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box
              sx={{
                background: theme.palette.success.main,
                borderRadius: "50%",
                width: 80,
                height: 80,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1.5,
                boxShadow: `0 4px 16px ${theme.palette.success.main}55`,
              }}
            >
              <Icon icon="material-symbols:check" fontSize={50} color="#FFF" />
            </Box>
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 700,
                fontFamily: "Poppins",
                color: theme.palette.success.main,
                mb: 2,
                letterSpacing: 0.5,
              }}
            >
              Pendaftaran Berhasil
            </Typography>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 500,
                fontFamily: "Poppins",
                color: theme.palette.text.disabled,
                textAlign: "center",
                mb: 1,
              }}
            >
              Pendaftaran akun Anda telah berhasil. Silahkan login menggunakan
              username dan password yang telah Anda buat.
            </Typography>
          </Box>
          <Button
            onClick={() => {
              setLoadingTrue();
              setRedirectingTrue();
              setTimeout(() => {
                // redirect to login
                window.location.href = "/login";
                onClose();
              }, 1000);
            }}
            variant="contained"
            fullWidth
            size="small"
            sx={{
              mt: 1,
              fontWeight: 700,
              fontSize: 17,
              textTransform: "none",
              color: "#fff",
              bgcolor: "error.main",
              boxShadow: "0 2px 8px rgba(255,0,0,0.10)",
              borderRadius: 2,
              transition: "background 0.2s, box-shadow 0.2s",
              "&:hover": {
                bgcolor: "error.dark",
                boxShadow: "0 4px 16px rgba(255,0,0,0.18)",
              },
            }}
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={22} color="inherit" /> : null
            }
          >
            {loading ? "Loading..." : "Login Sekarang"}
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
};

export default SuccessRegistration;
