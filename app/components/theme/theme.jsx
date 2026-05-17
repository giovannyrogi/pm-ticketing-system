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
          minHeight: 56,
          alignItems: "flex-end",
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
          paddingTop: "22px",
          paddingBottom: "8px",
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
          transform: "translate(12px, 8px) scale(1)",

          "&.MuiInputLabel-shrink": {
            transform: "translate(12px, 5px) scale(0.75)",
          },

          "&.Mui-focused": {
            color: "#E60909",
            fontWeight: 600,
          },
        },
      },
    },

    // ===== INPUT ADORNMENT =====
    MuiInputAdornment: {
      styleOverrides: {
        positionStart: {
          alignSelf: "flex-end",
          marginBottom: 8,
          marginRight: 10,
          minWidth: 20,
          justifyContent: "center",
        },

        positionEnd: {
          alignSelf: "flex-end",
          marginBottom: 4,
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
