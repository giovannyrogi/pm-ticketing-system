import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#E60909",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#FF9800",
      contrastText: "#ffffff",
    },
    text: {
      primary: "#232323",
      secondary: "#ffffff",
      disabled: "#7b7b7bff",
    },
    background: {
      default: "#ffffff",
      paperNavbar: "#212731",
    },
  },

  components: {
    // ========== TEXTFIELD FILLED ==========
    MuiFilledInput: {
      styleOverrides: {
        root: {
          fontFamily: "Poppins",
          backgroundColor: "#F4F6F8",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "#EEF1F3",
          },

          "&.Mui-focused": {
            backgroundColor: "#EEF1F3",
          },

          // underline default
          "&::before": {
            borderBottomColor: "#C7CCD1",
          },

          "&:hover::before": {
            borderBottomColor: "#E60909",
          },

          // underline saat fokus
          "&::after": {
            borderBottomColor: "#E60909",
          },
        },

        input: {
          color: "#232323",
          paddingTop: "24px",
          fontSize: "0.95rem",
        },
      },
    },

    // ===== LABEL =====
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#232323",
          fontWeight: 500,
          fontFamily: "Poppins",

          "&.Mui-focused": {
            color: "#E60909",
            fontWeight: 600,
          },
        },
      },
    },

    // ===== SELECT =====
    MuiSelect: {
      styleOverrides: {
        fontFamily: "Poppins",
        filled: {
          color: "#232323",
        },
      },
    },

    // ===== AUTOCOMPLETE =====
    MuiAutocomplete: {
      styleOverrides: {
        inputRoot: {
          backgroundColor: "#F4F6F8",
          borderRadius: 8,
          fontFamily: "Poppins",
          "&:hover": {
            backgroundColor: "#EEF1F3",
          },

          "&.Mui-focused": {
            backgroundColor: "#EEF1F3",
          },

          "& .MuiFilledInput-input": {
            // paddingTop: "24px",
          },
        },

        paper: {
          borderRadius: 10,
          marginTop: 4,
        },
      },
    },
  },
});

export default theme;
