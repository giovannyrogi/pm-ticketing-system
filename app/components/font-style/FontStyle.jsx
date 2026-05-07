import { Typography } from "@mui/material";

const FontStyle = ({
  children,
  fontWeight = "normal",
  fontSize = 12,
  color = "text.primary",
  sx = {},
  ...props
}) => {
  return (
    <Typography
      {...props}
      sx={{
        fontWeight,
        fontFamily: "Poppins, sans-serif",
        fontSize: `${fontSize}px`,
        whiteSpace: "pre-line",
        wordBreak: "break-word",
        overflowWrap: "anywhere",
        letterSpacing: "0.02em",
        color,
        ...sx, // Merge with custom styles
      }}
    >
      {children}
    </Typography>
  );
};

export default FontStyle;
