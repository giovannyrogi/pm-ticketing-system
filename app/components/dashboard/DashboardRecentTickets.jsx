"use client";

import FontStyle from "@/app/components/font-style/FontStyle";
import StatusTag from "@/app/components/status-tag/StatusTag";
import { Icon } from "@iconify/react";
import { Box, Button, Stack } from "@mui/material";
import { Tooltip } from "antd";
import moment from "moment";
import { useRouter } from "next/navigation";

const DashboardRecentTickets = ({ tickets = [] }) => {
  const router = useRouter();

  if (!tickets.length) {
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
          Belum ada tiket terbaru
        </FontStyle>
      </Box>
    );
  }

  return (
    <Stack spacing={1}>
      {tickets.map((ticket) => {
        const shortText =
          ticket.ticket_title?.length > 42
            ? `${ticket.ticket_title.substring(0, 42)}...`
            : ticket.ticket_title;

        return (
          <Box
            key={ticket.id}
            sx={{
              p: { xs: 1.25, md: 1.35 },
              borderRadius: 2.2,
              border: "1px solid rgba(15,23,42,0.08)",
              background:
                "linear-gradient(135deg, rgba(230,9,9,0.06) 0%, rgba(255,255,255,1) 70%)",
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr auto",
                md: "145px minmax(220px, 1fr) 110px 140px 120px 44px",
              },
              alignItems: "center",
              gap: { xs: 1.1, md: 1.4 },
            }}
          >
            <Box>
              <StatusTag label={ticket.ticket_code} color="green" />
            </Box>

            <Box minWidth={0}>
              <Tooltip title={ticket.ticket_title} placement="topLeft">
                <span>
                  <FontStyle
                    sx={{ fontSize: 12.5, fontWeight: 900, letterSpacing: 0 }}
                  >
                    {shortText || "-"}
                  </FontStyle>
                </span>
              </Tooltip>
              <FontStyle
                sx={{
                  mt: 0.3,
                  fontSize: 10,
                  fontWeight: 700,
                  color: "rgba(35,35,35,0.54)",
                  letterSpacing: 0,
                }}
              >
                {ticket.category_name || "-"} - {ticket.location_name || "-"}
              </FontStyle>
            </Box>

            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <StatusTag label={ticket.status} />
            </Box>

            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <FontStyle sx={{ fontSize: 12, fontWeight: 800, letterSpacing: 0 }}>
                {ticket.admin_name || "-"}
              </FontStyle>
            </Box>

            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <FontStyle sx={{ fontSize: 12, fontWeight: 800, letterSpacing: 0 }}>
                {moment(ticket.created_at).locale("id").format("DD MMM YYYY")}
              </FontStyle>
            </Box>

            <Button
              size="small"
              variant="contained"
              onClick={() => router.push(`/ticket-details/${ticket.id}`)}
              sx={{
                minWidth: 38,
                width: 38,
                height: 36,
                borderRadius: 1.7,
                boxShadow: "0 8px 16px rgba(230,9,9,0.24)",
                gridColumn: { xs: "2", md: "auto" },
                gridRow: { xs: "1 / span 2", md: "auto" },
              }}
            >
              <Icon icon="ant-design:message-outlined" fontSize={17} />
            </Button>

            <Box
              sx={{
                display: { xs: "flex", md: "none" },
                gap: 0.8,
                flexWrap: "wrap",
                gridColumn: "1 / -1",
              }}
            >
              <StatusTag label={ticket.status} />
              <StatusTag label={ticket.admin_name || "-"} color="geekblue" />
              <StatusTag
                label={moment(ticket.created_at).locale("id").format("DD MMM YYYY")}
                color="default"
              />
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
};

export default DashboardRecentTickets;
