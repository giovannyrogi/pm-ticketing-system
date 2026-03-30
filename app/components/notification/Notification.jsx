import { Alert } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";

export default function Notification({
  open,
  message,
  severity = "info",
  onClose,
  ...props
}) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      sx={{
        zIndex: 9999999,
      }}
      {...props}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        sx={{ width: "100%", color: "white" }}
        variant="filled"
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
