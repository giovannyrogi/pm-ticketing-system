"use client";

import FontStyle from "@/app/components/font-style/FontStyle";
import { Divider, Grid } from "@mui/material";

const TicketFooter = ({ data }) => {
  return (
    <>
      <Divider
        sx={{
          width: "100%",
        }}
      />

      <Grid size={12} align="right">
        <FontStyle fontSize={12} color="text.disabled" fontWeight="500">
          {`${data?.user?.name || "-"}`}
        </FontStyle>
      </Grid>
    </>
  );
};

export default TicketFooter;