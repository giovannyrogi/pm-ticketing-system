"use client";

import FontStyle from "@/app/components/font-style/FontStyle";
import StatusTag from "@/app/components/status-tag/StatusTag";
import { Icon } from "@iconify/react";
import { Box, Stack } from "@mui/material";

const DashboardWorkloadList = ({ admins = [] }) => {
  if (!admins.length) {
    return (
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          border: "1px dashed rgba(0,0,0,0.18)",
          textAlign: "center",
        }}
      >
        <FontStyle sx={{ fontSize: 12, fontWeight: 700, color: "text.disabled" }}>
          Belum ada data admin aktif
        </FontStyle>
      </Box>
    );
  }

  return (
    <Stack spacing={1.2}>
      {admins.map((admin) => (
        <Box
          key={admin.id}
          sx={{
            p: 1.45,
            borderRadius: 2.2,
            border: "1px solid rgba(15,23,42,0.08)",
            background:
              "linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(255,255,255,1) 70%)",
            boxShadow: "0 6px 18px rgba(15,23,42,0.05)",
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap={1.5}
          >
            <Box display="flex" alignItems="center" gap={1.2} minWidth={0}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  bgcolor: "rgba(37,99,235,0.12)",
                  color: "#2563EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon icon="mdi:account-tie-outline" fontSize={22} />
              </Box>

              <Box minWidth={0}>
                <FontStyle
                  sx={{ fontSize: 12.5, fontWeight: 900, letterSpacing: 0 }}
                >
                  {admin.name}
                </FontStyle>
                <FontStyle
                  sx={{
                    mt: 0.2,
                    fontSize: 10,
                    fontWeight: 700,
                    color: "rgba(35,35,35,0.54)",
                    letterSpacing: 0,
                    textTransform: "capitalize",
                  }}
                >
                  {admin.role}
                </FontStyle>
              </Box>
            </Box>

            <StatusTag label={`${admin.active_tickets} aktif`} color="geekblue" />
          </Box>

          <Box display="flex" gap={1} flexWrap="wrap" mt={1.35}>
            <StatusTag label={`${admin.completed_tickets} selesai`} color="green" />
            <StatusTag label={`Rating ${admin.average_rating}`} color="gold" />
          </Box>
        </Box>
      ))}
    </Stack>
  );
};

export default DashboardWorkloadList;
