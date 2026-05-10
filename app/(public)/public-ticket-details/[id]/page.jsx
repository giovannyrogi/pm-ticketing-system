"use client";

import FontStyle from "@/app/components/font-style/FontStyle";
import LoadingBackdrop from "@/app/components/loading/Backdrop";
import PublicLikeButton from "@/app/components/public-tickets/PublicLikeButton";
import TicketAttachments from "@/app/components/tickets/TicketAttachments";
import TicketDescription from "@/app/components/tickets/TicketDescription";
import TicketHeader from "@/app/components/tickets/TicketHeader";
import TicketInformation from "@/app/components/tickets/TicketInformation";
import TicketMessages from "@/app/components/tickets/TicketMessages";
import TicketRatingSection from "@/app/components/tickets/TicketRatingSection";
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
  useMediaQuery,
} from "@mui/material";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const PublicTicketDetail = () => {
  const hasTrackedView = useRef(false);
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
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    if (id) {
      getTicketDetail();
    }
  }, [id]);

  useEffect(() => {
    const incrementView = async () => {
      try {
        /**
         * ===============================
         * PREVENT DOUBLE EXECUTION
         * ===============================
         */
        if (hasTrackedView.current) return;

        /**
         * ===============================
         * SESSION KEY
         * ===============================
         */
        const storageKey = `public-ticket-view-${id}`;

        /**
         * ===============================
         * PREVENT MULTIPLE VIEW
         * ===============================
         */
        if (sessionStorage.getItem(storageKey)) {
          return;
        }

        hasTrackedView.current = true;

        await axios.post("/api/public/tickets/add-view", {
          ticket_id: id,
        });

        sessionStorage.setItem(storageKey, "true");
      } catch (err) {
        console.log("ERROR ADD VIEW:", err);
      }
    };

    if (id) {
      incrementView();
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          mb: 2,
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <VisibilityOutlinedIcon sx={{ fontSize: 20 }} />
          <FontStyle
            sx={{
              fontSize: 12,
              fontWeight: "500",
            }}
          >
            {data.stats?.views || 0} Views
          </FontStyle>
        </Box>
        {data && (
          <PublicLikeButton
            ticketId={data.id}
            initialLikes={data.stats?.likes || 0}
            initialLiked={data.stats?.liked || false}
            isLoggedIn={Boolean(document.cookie.includes("dataUser"))}
          />
        )}
      </Box>

      {/* <Button
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
        </Button> */}

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
          <FontStyle
            sx={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
              fontSize: 14,
              color: "text.disabled",
            }}
          >
            Ticket publik tidak ditemukan
          </FontStyle>
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

          <TicketRatingSection data={data} readOnly />

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

export default PublicTicketDetail;
