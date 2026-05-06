"use client";

import { Box, Divider, Grid } from "@mui/material";
import FontStyle from "@/app/components/font-style/FontStyle";

const TicketHeader = ({ data }) => {
  return (
    <>
      <Grid size={12}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={1}
        >
          <FontStyle fontWeight="bold" fontSize={14} color="text.disabled">
            #{data?.ticket_code || "-"}
          </FontStyle>

          <FontStyle fontSize={12} fontWeight="500" color="text.disabled">
            {data?.created_at_human}
          </FontStyle>
        </Box>
      </Grid>

      <Grid size={12}>
        <Divider />
      </Grid>
    </>
  );
};

export default TicketHeader;