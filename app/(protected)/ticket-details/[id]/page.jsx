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
import { useParams } from "next/navigation";
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

const TicketDetail = () => {
  const theme = useTheme();
  const { id } = useParams();
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
  const messagesEndRef = useRef(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const MAX_SIZE = 3 * 1024 * 1024; // gambar maks 3MB
  const DESC_MAX = 500;

  const isAssignedAdmin =
    ["admin", "superadmin"].includes(user?.user?.role) &&
    user?.user?.id === data?.admin?.id;

  const isTicketOwner = Number(user?.user?.id) === Number(data?.user?.id);

  const canReply = data?.waiting_reply_from === user?.user?.role;

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
    if (id) getDetail(true);
  }, [id]);

  useEffect(() => {
    scrollToBottom();
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
    try {
      setSendingMessage(true);
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
      {data?.status === "proses" && (
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

            {((isAssignedAdmin &&
              ["admin", "superadmin"].includes(user?.user?.role)) ||
              (isTicketOwner && canReply)) && (
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
            <Box ref={messagesEndRef} />
          </>
        </Paper>
      )}
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
