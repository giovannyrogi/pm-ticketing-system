"use client";

import FontStyle from "@/app/components/font-style/FontStyle";
import { Box, Grid } from "@mui/material";

const TicketDescription = ({ data }) => {
  return (
    <>
      {/* SUBJEK */}
      <Grid size={12} mt={2}>
        <FontStyle fontSize={12} fontWeight="bold" color="text.disabled">
          Subjek Tiket
        </FontStyle>

        <FontStyle fontSize={12} fontWeight="600">
          {data?.ticket_title || "-"}
        </FontStyle>
      </Grid>

      {/* DESKRIPSI */}
      <Grid size={12} mt={2}>
        <FontStyle fontSize={12} fontWeight="bold" color="text.disabled">
          Deskripsi
        </FontStyle>

        <Box
          sx={{
            mt: 1,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: "#fafafa",
            border: "1px solid rgba(0,0,0,0.20)",
          }}
        >
          <FontStyle
            fontSize={13}
            sx={{
              lineHeight: 1.6,
              wordBreak: "break-word",
              overflowWrap: "anywhere",
              textAlign: "justify",
            }}
          >
            {data.ticket_description || "-"}
          </FontStyle>
        </Box>
      </Grid>
    </>
  );
};

export default TicketDescription;
