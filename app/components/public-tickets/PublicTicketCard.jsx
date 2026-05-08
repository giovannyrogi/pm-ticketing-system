"use client";

import StatusTag from "@/app/components/status-tag/StatusTag";
import {
  Box,
  ButtonBase,
  Chip,
  Divider,
  Grid,
  Stack,
  Tooltip,
  useTheme,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FontStyle from "../font-style/FontStyle";
import { Icon } from "@iconify/react";

const PublicTicketCard = ({ ticket }) => {
  const theme = useTheme();
  const router = useRouter();
  const [liked, setLiked] = useState(false);

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked((prev) => !prev);
  };

  console.log("ticket", ticket);

  return (
    <Box
      sx={{
        border: "1px solid rgba(0,0,0,0.14)",
        borderRadius: 2,
        bgcolor: "background.paper",
        overflow: "hidden",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          borderColor: "rgba(211,47,47,0.45)",
          boxShadow: "0 10px 28px rgba(0,0,0,0.08)",
        },
      }}
    >
      <ButtonBase
        onClick={() => router.push(`/public-ticket-details/${ticket.id}`)}
        sx={{
          width: "100%",
          display: "block",
          textAlign: "left",
        }}
      >
        <Grid container spacing={0}>
          <Grid
            size={12}
            sx={{
              p: "15px 15px 8px 15px",
            }}
          >
            <FontStyle
              sx={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: "bold",
                fontSize: 14,
                lineHeight: 1.45,
                color: "text.disabled",
              }}
            >
              {ticket.ticket_title}
            </FontStyle>
          </Grid>

          <Divider
            sx={{
              width: "100%",
              mb: 1,
            }}
          />

          <Grid
            size={12}
            sx={{
              p: "0px 15px 8px 15px",
            }}
            container
          >
            <Grid size={12}>
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                alignItems="center"
              >
                <StatusTag
                  label={ticket?.location?.name || "-"}
                  color={theme.palette.primary.main}
                  fontSize={10}
                />
                <StatusTag
                  color="blue"
                  label={ticket?.category?.name || "-"}
                  fontSize={10}
                />
                {/* <StatusTag label={ticket.status || "-"} /> */}
              </Stack>
            </Grid>

            <Grid
              size={12}
              sx={{
                mt: 2,
                mb: 2,
                // p: 1.5,
                // borderRadius: 2,
                // backgroundColor: "#fafafa",
                // border: "1px solid rgba(0,0,0,0.20)",
              }}
            >
              <FontStyle
                sx={{
                  fontFamily: "Poppins, sans-serif",
                  fontSize: 12,
                  lineHeight: 1.7,
                  fontWeight: 500,
                  color: "text.disabled",
                }}
              >
                {ticket.ticket_description.length > 150
                  ? `${ticket.ticket_description.substring(0, 150)}...`
                  : ticket.ticket_description || "-"}
              </FontStyle>
            </Grid>
          </Grid>
        </Grid>

        <Divider />

        <Box
          sx={{
            px: { xs: 2, md: 2.25 },
            py: 1.25,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
              <FontStyle
                sx={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "text.disabled",
                }}
              >
                {ticket.stats?.views || 0}
              </FontStyle>
            </Stack>

            <Stack direction="row" spacing={0.5} alignItems="center">
              {liked ? (
                <FavoriteIcon sx={{ fontSize: 16, color: "error.main" }} />
              ) : (
                <FavoriteBorderIcon
                  sx={{ fontSize: 16, color: "error.main" }}
                />
              )}
              <FontStyle
                sx={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "text.disabled",
                }}
              >
                {(ticket.stats?.likes || 0) + (liked ? 1 : 0)}
              </FontStyle>
            </Stack>
          </Stack>

          <Stack
            direction="row"
            spacing={0.7}
            alignItems="center"
            sx={{ minWidth: 0 }}
          >
            {/* <CalendarMonthOutlinedIcon
              sx={{ fontSize: 16, color: "text.disabled" }}
            /> */}
            <Icon
              icon={"mingcute:time-line"}
              style={{ fontSize: 16, color: theme.palette.text.disabled }}
            />
            <FontStyle
              sx={{
                fontSize: 12,
                fontWeight: 500,
                color: "text.disabled",
                textAlign: "right",
              }}
            >
              {ticket.published_at_human || "-"} • {ticket.user?.name || "-"}
            </FontStyle>
          </Stack>
        </Box>
      </ButtonBase>
    </Box>
  );
};

export default PublicTicketCard;
