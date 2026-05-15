import FontStyle from "@/app/components/font-style/FontStyle";
import { Box, Button, Paper, Stack } from "@mui/material";
import { Icon } from "@iconify/react";

const AccountActionCard = ({
  icon,
  title,
  description,
  buttonLabel,
  color,
  tone,
  onClick,
}) => {
  return (
    <Paper
      elevation={2}
      sx={{
        height: "100%",
        p: { xs: 1.5, md: 2 },
        borderRadius: 2.5,
        border: "1px solid rgba(0,0,0,0.10)",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Stack spacing={1.3}>
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: 2.3,
            display: "grid",
            placeItems: "center",
            color,
            bgcolor: tone,
          }}
        >
          <Icon icon={icon} fontSize={30} />
        </Box>

        <Box>
          <FontStyle
            sx={{
              fontSize: 14,
              fontWeight: 700,
              color: "text.primary",
              letterSpacing: 0,
            }}
          >
            {title}
          </FontStyle>
          <FontStyle
            sx={{
              mt: 0.5,
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(35,35,35,0.58)",
              lineHeight: 1.65,
              letterSpacing: 0,
            }}
          >
            {description}
          </FontStyle>
        </Box>
      </Stack>

      <Button
        fullWidth
        variant="outlined"
        onClick={onClick}
        sx={{
          borderRadius: 2,
          color,
          borderColor: `${color}55`,
          fontFamily: "Poppins, sans-serif",
          fontWeight: 600,
          textTransform: "none",
          "&:hover": {
            borderColor: color,
            bgcolor: tone,
          },
        }}
      >
        {buttonLabel}
      </Button>
    </Paper>
  );
};

export default AccountActionCard;
