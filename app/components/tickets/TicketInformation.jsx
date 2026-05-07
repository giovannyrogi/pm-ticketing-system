"use client";

import FontStyle from "@/app/components/font-style/FontStyle";
import StatusTag from "@/app/components/status-tag/StatusTag";
import { Icon } from "@iconify/react";
import { Box, Grid, useTheme } from "@mui/material";

const TicketInformation = ({ data }) => {
  const theme = useTheme();

  return (
    <Grid container spacing={2} size={12} mt={1}>
      {/* Nama Pelapor */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <Box display="flex" gap={1}>
          <Icon icon="mdi:user" width={18} color={theme.palette.text.disabled} />

          <Box>
            <FontStyle fontSize={12} fontWeight="bold" color="text.disabled">
              Nama Pelapor
            </FontStyle>

            <FontStyle fontSize={13} fontWeight="500">
              {data?.user?.name || "-"}
            </FontStyle>
          </Box>
        </Box>
      </Grid>

      {/* LOKASI */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <Box display="flex" gap={1}>
          <Icon icon="mdi:map-marker" width={18} color={theme.palette.text.disabled} />

          <Box>
            <FontStyle fontSize={12} fontWeight="bold" color="text.disabled">
              Lokasi
            </FontStyle>

            <FontStyle fontSize={13} fontWeight="500">
              {data?.location?.name || "-"}
            </FontStyle>
          </Box>
        </Box>
      </Grid>

      {/* STATUS */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <Box display="flex" gap={1}>
          <Icon icon="mdi:progress-clock" width={18} color={theme.palette.text.disabled} />

          <Box>
            <FontStyle fontSize={12} fontWeight="bold" color="text.disabled">
              Status
            </FontStyle>

            <StatusTag label={data?.status || "-"} />
          </Box>
        </Box>
      </Grid>

      {/* KATEGORI */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <Box display="flex" gap={1}>
          <Icon icon="ic:baseline-category" width={18} color={theme.palette.text.disabled} />

          <Box>
            <FontStyle fontSize={12} fontWeight="bold" color="text.disabled">
              Kategori
            </FontStyle>

            <StatusTag color={"blue"} label={data?.category?.name || "-"} />
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default TicketInformation;
