// Style font untuk bold dan normal, lalu export sebagai komponen terpisah
import { Typography } from "@mui/material";

const FontStyle = ({ children, fontWeight }) => {
  return (
    <Typography
      style={{
        fontWeight: fontWeight || "normal", // default ke normal jika tidak diberikan
        fontFamily: "Poppins, sans-serif",
        fontSize: "12px",
      }}
    >
      {children}
    </Typography>
  );
};

export default FontStyle;
