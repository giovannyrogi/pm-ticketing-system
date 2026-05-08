"use client";

import LoadingBackdrop from "@/app/components/loading/Backdrop";
import PublicLikeButton from "@/app/components/public-tickets/PublicLikeButton";
import TicketAttachments from "@/app/components/tickets/TicketAttachments";
import TicketDescription from "@/app/components/tickets/TicketDescription";
import TicketHeader from "@/app/components/tickets/TicketHeader";
import TicketInformation from "@/app/components/tickets/TicketInformation";
import TicketMessages from "@/app/components/tickets/TicketMessages";
import TicketStatusInformation from "@/app/components/tickets/TicketStatusInformation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Alert,
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PublicTicketDetail = () => {
  const { id } = useParams();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const getTicketDetail = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const res = await axios.get(`/api/public/tickets/ticket-details/${id}`);

        if (res.data.success) {
          setData(res.data.data);
        } else {
          setData(null);
          setErrorMessage(res.data.message || "Ticket publik tidak ditemukan");
        }
      } catch (err) {
        console.log("ERROR PUBLIC DETAIL:", err);
        setData(null);
        setErrorMessage(
          err?.response?.data?.message || "Ticket publik tidak ditemukan",
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      getTicketDetail();
    }
  }, [id]);

  if (loading) {
    return <LoadingBackdrop message="Loading ticket..." open />;
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1120,
        mx: "auto",
        pb: 8,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/")}
          sx={{
            alignSelf: { xs: "flex-start", sm: "center" },
            borderRadius: 2,
            textTransform: "none",
            fontFamily: "Poppins, sans-serif",
            fontWeight: 700,
          }}
        >
          Kembali ke Beranda
        </Button>

        {data && (
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <VisibilityOutlinedIcon sx={{ fontSize: 19 }} />
              <Typography sx={metaTextSx}>
                {data.stats?.views || 0} Views
              </Typography>
            </Stack>

            <PublicLikeButton initialLikes={data.stats?.likes || 0} />
          </Stack>
        )}
      </Stack>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {!data ? (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            border: "1px dashed rgba(0,0,0,0.18)",
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: 0,
            }}
          >
            Ticket publik tidak ditemukan
          </Typography>
        </Paper>
      ) : (
        <>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 2.5 },
              borderRadius: 2,
              border: "1px solid rgba(0, 0, 0, 0.20)",
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            }}
          >
            <Grid container spacing={1}>
              <TicketHeader data={data} />
              <TicketInformation data={data} />
              <TicketDescription data={data} />
              <TicketAttachments data={data} isMobile={isMobile} />
            </Grid>
          </Paper>

          <TicketStatusInformation data={data} />

          <Paper
            elevation={0}
            sx={{
              mt: 3,
              p: { xs: 2, md: 2.5 },
              borderRadius: 2,
              border: "1px solid rgba(0, 0, 0, 0.20)",
              boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            <TicketMessages messages={data.messages || []} />
          </Paper>
        </>
      )}
    </Box>
  );
};

const metaTextSx = {
  fontFamily: "Poppins, sans-serif",
  fontSize: 13,
  fontWeight: 700,
  color: "text.secondary",
  letterSpacing: 0,
};

export default PublicTicketDetail;
