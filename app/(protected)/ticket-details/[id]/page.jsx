"use client";

import LoadingBackdrop from "@/app/components/loading/Backdrop";
import Notification from "@/app/components/notification/Notification";
import {
  Box,
  Grid,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@/app/utils/useUser";
import TicketHeader from "@/app/components/tickets/TicketHeader";
import TicketInformation from "@/app/components/tickets/TicketInformation";
import TicketDescription from "@/app/components/tickets/TicketDescription";
import TicketAttachments from "@/app/components/tickets/TicketAttachments";
import TicketFooter from "@/app/components/tickets/TicketFooter";
import TicketActions from "@/app/components/tickets/TicketActions";
import TicketMessages from "@/app/components/tickets/TicketMessages";
import TicketReplyForm from "@/app/components/tickets/TicketReplyForm";
import RejectTicketModal from "./RejectTicketModal";
import FontStyle from "@/app/components/font-style/FontStyle";
import TicketRejectedInformation from "@/app/components/tickets/TicketRejectedInformation";
import ActionConfirmationModal from "@/app/components/modal/ActionConfirmationModal";
import TicketStatusInformation from "@/app/components/tickets/TicketStatusInformation";
import TicketRatingSection from "@/app/components/tickets/TicketRatingSection";
import TicketWaitingReplyInfo from "@/app/components/tickets/TicketWaitingReplyInfo";

const TicketDetail = () => {
  const theme = useTheme();
  const { id } = useParams();
  const router = useRouter();
  const user = useUser();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const previousMessageCountRef = useRef(0);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const MAX_SIZE = 3 * 1024 * 1024; // gambar maks 3MB
  const DESC_MAX = 500;

  const getReplySide = (role) =>
    ["admin", "superadmin"].includes(role) ? "staff" : role;

  const canReplyToSide = (waitingReplyFrom, role) => {
    const replySide = getReplySide(role);

    return (
      waitingReplyFrom === replySide ||
      (waitingReplyFrom === "admin" && replySide === "staff")
    );
  };

  const isAssignedAdmin =
    ["admin", "superadmin"].includes(user?.user?.role) &&
    user?.user?.id === data?.admin?.id;

  const isTicketOwner = Number(user?.user?.id) === Number(data?.user?.id);

  const canReply = canReplyToSide(data?.waiting_reply_from, user?.user?.role);

  const shouldShowChatSection = ["proses", "selesai"].includes(data?.status);

  const shouldShowReplyForm =
    data?.status === "proses" &&
    ((isAssignedAdmin && ["admin", "superadmin"].includes(user?.user?.role)) ||
      isTicketOwner) &&
    canReply;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  const getDetail = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true); /* untuk refresh */

      const res = await axios.get(`/api/ticket-details/${id}`);
      console.log("response", res);

      setTimeout(() => {
        if (res.data.success) {
          setData(res?.data?.data);
          setMessages(res?.data?.data?.messages);
        } else {
          setData(null);
        }

        if (showLoading) {
          setLoading(false);
          setInitialized(true);
        }
      }, 1000);
    } catch (err) {
      console.log("ERROR:", err);

      const status = err?.response?.status;

      /**
       * ===============================
       * UNAUTHORIZED
       * ===============================
       */
      if (status === 401) {
        router.replace("/login");
        return;
      }

      /**
       * ===============================
       * FORBIDDEN / NOT FOUND
       * ===============================
       */
      if (status === 403 || status === 404) {
        /**
         * ===============================
         * GET ROLE FROM COOKIE
         * ===============================
         */
        let role = null;

        try {
          const cookie = document.cookie
            .split("; ")
            .find((row) => row.startsWith("dataUser="));

          if (cookie) {
            const parsed = JSON.parse(decodeURIComponent(cookie.split("=")[1]));

            role = parsed?.role;
          }
        } catch (e) {
          console.log("COOKIE PARSE ERROR:", e);
        }

        /**
         * ===============================
         * REDIRECT BASED ROLE
         * ===============================
         */
        if (role === "user") {
          router.replace("/my-tickets");
          return;
        }

        // if (["admin", "superadmin"].includes(role)) {
        //   router.replace("/ticket-list");
        //   return;
        // }

        /**
         * FALLBACK
         */
        router.replace("/");
        return;
      }

      setTimeout(() => {
        setData(null);

        if (showLoading) {
          setLoading(false);
          setInitialized(true);
        }
      }, 1000);
    }
  };

  useEffect(() => {
    /**
     * ===============================
     * ONLY POLLING WHEN TICKET ACTIVE
     * ===============================
     */
    if (data?.status !== "proses") return;

    /**
     * ===============================
     * ONLY WHEN TAB ACTIVE
     * ===============================
     */
    let interval;

    const startPolling = () => {
      interval = setInterval(() => {
        /**
         * ===============================
         * SKIP IF TAB NOT ACTIVE
         * ===============================
         */
        if (document.hidden) return;

        getDetail(false);
      }, 10000); // refresh data setiap 10 detik
    };

    startPolling();

    return () => {
      clearInterval(interval);
    };
  }, [data?.status]);

  useEffect(() => {
    if (id) getDetail(true);
  }, [id]);

  useEffect(() => {
    /**
     * ===============================
     * PREVIOUS MESSAGE COUNT
     * ===============================
     */
    const previousCount = previousMessageCountRef.current;

    /**
     * ===============================
     * CURRENT MESSAGE COUNT
     * ===============================
     */
    const currentCount = messages.length;

    /**
     * ===============================
     * AUTO SCROLL ONLY IF NEW MESSAGE
     * ===============================
     */
    if (currentCount > previousCount) {
      scrollToBottom();
    }

    /**
     * ===============================
     * UPDATE PREVIOUS COUNT
     * ===============================
     */
    previousMessageCountRef.current = currentCount;
  }, [messages]);

  const handleAccept = async () => {
    try {
      setLoading(true);

      const res = await axios.post("/api/tickets/approve-ticket", {
        ticket_id: data.id,
      });

      if (res.data.success) {
        setSnackbar({
          open: true,
          message: "Berhasil menerima ticket",
          severity: "success",
        });

        await getDetail();
      } else {
        setSnackbar({
          open: true,
          message: res?.data?.message || "Terjadi kesalahan",
          severity: "error",
        });
      }

      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.log("error", err);

      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  if (!initialized || loading) {
    return <LoadingBackdrop message="Loading ticket..." open />;
  }

  if (!data) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          Data tidak ditemukan
        </Typography>
      </Box>
    );
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    for (let file of files) {
      if (file.size > MAX_SIZE) {
        setSnackbar({
          open: true,
          message: "Ukuran gambar maksimal 3MB",
          severity: "error",
        });
        return;
      }
    }

    if (files.length + images.length > 3) {
      setSnackbar({
        open: true,
        message: "Maksimal 3 gambar",
        severity: "error",
      });
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const previews = newImages.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);

    // reset input
    e.target.value = "";
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);

    const previews = newImages.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleSendMessage = async () => {
    try {
      setSendingMessage(true);
      // validasi
      if (!message) {
        setSnackbar({
          open: true,
          message: "Pesan tidak boleh kosong",
          severity: "error",
        });
        setSendingMessage(false);
        return;
      }

      if (message.length > DESC_MAX) {
        setSnackbar({
          open: true,
          message: "Maksimal 500 karakter",
          severity: "error",
        });
        setSendingMessage(false);
        return;
      }

      if (images.length > 3) {
        setSnackbar({
          open: true,
          message: "Maksimal 3 gambar",
          severity: "error",
        });
        setSendingMessage(false);
        return;
      }

      const formData = new FormData();

      formData.append("ticket_id", data.id);

      formData.append("message", message);

      images.forEach((img) => {
        formData.append("images", img);
      });

      const res = await axios.post("/api/tickets/send-message", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);

        setMessage("");

        setImages([]);

        setPreviewImages([]);

        setSnackbar({
          open: true,
          message: "Pesan berhasil dikirim",
          severity: "success",
        });

        await getDetail(false);
      } else {
        setSnackbar({
          open: true,
          message: res.data.message || "Terjadi kesalahan",
          severity: "error",
        });
      }
    } catch (err) {
      console.log("error", err);

      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "Terjadi kesalahan",
        severity: "error",
      });
    } finally {
      setTimeout(() => {
        setSendingMessage(false);
      }, 1000);
    }
  };

  const handleOpenCompleteModal = () => {
    setCompleteModalOpen(true);
  };

  const handleOpenPublishModal = () => {
    setPublishModalOpen(true);
  };

  const handleCompleteTicket = async () => {
    setSendingMessage(true);

    // Jika belum ada history pesan, maka tidak bisa diselesaikan
    if (!data.messages.length) {
      setTimeout(() => {
        setSnackbar({
          open: true,
          message: "Tiket belum memiliki history percakapan",
          severity: "error",
        });
        setSendingMessage(false);
      }, 1000);
      return;
    }

    try {
      const res = await axios.post("/api/tickets/complete-ticket", {
        ticket_id: data.id,
      });
      if (res.data.success) {
        setSnackbar({
          open: true,
          message: "Ticket berhasil diselesaikan",
          severity: "success",
        });
        await getDetail();
      } else {
        setSnackbar({
          open: true,
          message: res?.data?.message || "Terjadi kesalahan",
          severity: "error",
        });
      }
    } catch (err) {
      console.log(err);
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "Terjadi kesalahan",
        severity: "error",
      });
    } finally {
      setTimeout(() => {
        setSendingMessage(false);
      }, 1000);
    }
  };

  const handlePublishTicket = async () => {
    try {
      setSendingMessage(true);

      const res = await axios.post("/api/tickets/publish-ticket", {
        ticket_id: data.id,
      });

      if (res.data.success) {
        setSnackbar({
          open: true,
          message: "Ticket berhasil dipublish",
          severity: "success",
        });

        await getDetail();
      } else {
        setSnackbar({
          open: true,
          message: res?.data?.message || "Terjadi kesalahan",
          severity: "error",
        });
      }
    } catch (err) {
      console.log(err);

      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "Terjadi kesalahan",
        severity: "error",
      });
    } finally {
      setTimeout(() => {
        setSendingMessage(false);
      }, 1000);
    }
  };

  const handleSubmitRating = async (payload) => {
    try {
      setLoading(true);
      setRatingLoading(true);

      const res = await axios.post("/api/tickets/rate-ticket", {
        ticket_id: data.id,
        rating_value: payload.rating_value,
        rating_comment: payload.rating_comment,
      });

      if (res.data.success) {
        setSnackbar({
          open: true,
          message: "Penilaian berhasil dikirim",
          severity: "success",
        });

        await getDetail(false);
      } else {
        setSnackbar({
          open: true,
          message: res?.data?.message || "Terjadi kesalahan",
          severity: "error",
        });
      }
    } catch (err) {
      console.log(err);

      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "Terjadi kesalahan",
        severity: "error",
      });
    } finally {
      setTimeout(() => {
        setRatingLoading(false);
        setLoading(false);
      }, 800);
    }
  };

  return (
    <Box mb={10}>
      {/* =========================
        TICKET INFORMATION
      ========================= */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2 },
          borderRadius: 3,
          border: "1px solid rgba(0, 0, 0, 0.20)",
          boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
        }}
      >
        <Grid container spacing={1}>
          <TicketHeader data={data} />
          <TicketInformation data={data} />
          <TicketDescription data={data} />
          <TicketAttachments data={data} isMobile={isMobile} />
          {/* <TicketFooter data={data} /> */}
        </Grid>

        <TicketActions
          data={data}
          user={user}
          handleAccept={handleAccept}
          handleOpenCompleteModal={handleOpenCompleteModal}
          handleOpenPublishModal={handleOpenPublishModal}
          openModal={openModal}
          setOpenModal={setOpenModal}
        />
      </Paper>

      {/* =========================
        TICKET STATUS INFORMATION
      ========================= */}
      <TicketStatusInformation data={data} />

      {/* =========================
        CHAT SECTION
      ========================= */}
      {shouldShowChatSection && (
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: { xs: 2, md: 2 },
            borderRadius: 3,
            border: "1px solid rgba(0, 0, 0, 0.20)",
            boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          {/* CHAT */}
          <>
            <TicketMessages messages={messages} user={user} />

            {shouldShowReplyForm && (
              <TicketReplyForm
                message={message}
                setMessage={setMessage}
                onSubmit={handleSendMessage}
                loading={sendingMessage}
                data={data}
                user={user}
                images={images}
                previewImages={previewImages}
                handleImageChange={handleImageChange}
                handleRemoveImage={handleRemoveImage}
                DESC_MAX={DESC_MAX}
              />
            )}
          </>
        </Paper>
      )}

      {/* =========================
        WAITING REPLY INFO
      ========================= */}
      <TicketWaitingReplyInfo
        waitingReplyFrom={data?.waiting_reply_from}
        currentRole={user?.user?.role}
        userName={data?.user?.name}
        status={data?.status}
      />

      {/* =========================
        TICKET RATING SECTION
      ========================= */}
      <TicketRatingSection
        data={data}
        user={user}
        loading={ratingLoading}
        onSubmit={handleSubmitRating}
        DESC_MAX={DESC_MAX}
      />

      <Box ref={messagesEndRef} sx={{ mt: 10 }} />

      <LoadingBackdrop message="Memproses Pesan..." open={sendingMessage} />
      <RejectTicketModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        loading={loading}
        setLoading={setLoading}
        getDetail={getDetail}
        data={data}
        onNotify={(onNotify) => setSnackbar(onNotify)}
      />
      <Notification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
      <ActionConfirmationModal
        open={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        title="Selesaikan Laporan?"
        description="Laporan akan ditandai sebagai selesai dan percakapan pada tiket ini akan ditutup secara permanen untuk user maupun admin. Pastikan seluruh kendala telah ditangani dengan baik sebelum melanjutkan."
        icon="material-symbols:task-alt-rounded"
        color="success"
        textColor={theme.palette.success.main}
        confirmText="Ya, Selesaikan"
        loading={sendingMessage}
        onConfirm={async () => {
          await handleCompleteTicket();
          setCompleteModalOpen(false);
        }}
      />

      <ActionConfirmationModal
        open={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        title="Publish Laporan?"
        description="Tiket akan dipublikasikan dan dapat dilihat oleh semua pengguna termasuk pengunjung tanpa akun."
        icon="carbon:ibm-elo-publishing"
        color="error"
        textColor={theme.palette.error.main}
        confirmText="Publish Sekarang"
        loading={sendingMessage}
        onConfirm={async () => {
          await handlePublishTicket();
          setPublishModalOpen(false);
        }}
      />
    </Box>
  );
};

export default TicketDetail;
