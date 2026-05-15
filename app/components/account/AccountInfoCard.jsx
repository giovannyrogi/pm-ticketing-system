import FontStyle from "@/app/components/font-style/FontStyle";
import { Box, Chip, Grid, Paper, Stack } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Icon } from "@iconify/react";

const InfoItem = ({ icon, label, value, color, tone }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: "1px solid rgba(0,0,0,0.09)",
        bgcolor: "rgba(250,250,250,0.78)",
      }}
    >
      <Stack direction="row" spacing={1.2} alignItems="center">
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            color,
            bgcolor: tone,
            flexShrink: 0,
          }}
        >
          <Icon icon={icon} fontSize={28} />
        </Box>
        <Box minWidth={0}>
          <FontStyle
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: "text.disabled",
              letterSpacing: 0,
            }}
          >
            {label}
          </FontStyle>
          <FontStyle
            sx={{
              mt: 0.2,
              fontSize: 13,
              fontWeight: 700,
              color: "text.primary",
              letterSpacing: 0,
              overflowWrap: "anywhere",
            }}
          >
            {value || "-"}
          </FontStyle>
        </Box>
      </Stack>
    </Paper>
  );
};

const AccountInfoCard = ({ profile }) => {
  const theme = useTheme();
  const initial = profile?.full_name?.charAt(0)?.toUpperCase() || "U";
  const primaryTone = alpha(theme.palette.primary.main, 0.09);

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 2.5,
        border: "1px solid rgba(0,0,0,0.10)",
        background:
          "linear-gradient(135deg, rgba(230,9,9,0.08) 0%, rgba(255,255,255,1) 48%, rgba(22,163,74,0.08) 100%)",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        sx={{ mb: 2 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 62,
              height: 62,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              bgcolor: theme.palette.primary.main,
              color: "#fff",
              fontFamily: "Poppins, sans-serif",
              fontSize: 26,
              fontWeight: 900,
              boxShadow: "0 10px 24px rgba(230,9,9,0.18)",
            }}
          >
            {initial}
          </Box>

          <Box>
            <FontStyle
              sx={{
                fontSize: { xs: 20, md: 24 },
                fontWeight: 700,
                color: "text.primary",
                letterSpacing: 0,
                lineHeight: 1.15,
              }}
            >
              {profile?.full_name || "-"}
            </FontStyle>
            <Stack direction="row" spacing={1} alignItems="center" mt={0.8}>
              <Chip
                label={profile?.role || "-"}
                size="small"
                sx={{
                  height: 25,
                  borderRadius: 2,
                  textTransform: "capitalize",
                  bgcolor: alpha(theme.palette.primary.main, 0.09),
                  color: theme.palette.primary.main,
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                }}
              />
              <Chip
                label={profile?.is_active ? "Aktif" : "Tidak aktif"}
                size="small"
                sx={{
                  height: 25,
                  borderRadius: 2,
                  bgcolor: "rgba(22,163,74,0.10)",
                  color: "#16A34A",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                }}
              />
            </Stack>
          </Box>
        </Stack>
      </Stack>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoItem
            icon="mdi:account-outline"
            label="Username"
            value={profile?.username}
            color="#2563EB"
            tone="rgba(37, 99, 235, 0.12)"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoItem
            icon="mdi:email-outline"
            label="Email"
            value={profile?.email}
            color="#B7791F"
            tone="rgba(245, 158, 11, 0.14)"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoItem
            icon="mdi:whatsapp"
            label="Nomor WhatsApp"
            value={profile?.phone_number ? `0${profile.phone_number}` : "-"}
            color="#16A34A"
            tone="rgba(22, 163, 74, 0.12)"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoItem
            icon="mdi:shield-account-outline"
            label="Hak akses"
            value={profile?.role}
            color={theme.palette.primary.main}
            tone={primaryTone}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AccountInfoCard;
