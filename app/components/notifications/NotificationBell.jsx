"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  alpha,
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  Popover,
  Stack,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import FontStyle from "@/app/components/font-style/FontStyle";
import Notification from "@/app/components/notification/Notification";

const NOTIFICATION_LIMIT = 10;
const POLLING_INTERVAL_MS = 10000;

const TYPE_ICON = {
  ticket_created: "solar:ticket-sale-bold-duotone",
  ticket_approved: "solar:check-circle-bold-duotone",
  ticket_assigned: "solar:user-check-bold-duotone",
  ticket_rejected: "solar:close-circle-bold-duotone",
  ticket_rejected_by_staff: "solar:close-circle-bold-duotone",
  ticket_completed: "solar:verified-check-bold-duotone",
  ticket_completed_by_staff: "solar:verified-check-bold-duotone",
  ticket_published: "solar:global-bold-duotone",
  ticket_published_by_staff: "solar:global-bold-duotone",
  ticket_message: "solar:chat-round-dots-bold-duotone",
  ticket_rated: "solar:star-bold-duotone",
  ticket_rated_by_user: "solar:star-bold-duotone",
  ticket_deleted_by_user: "solar:trash-bin-trash-bold-duotone",
};

const getHiddenStorageKey = (userId) => `pmcare-hidden-notifications-${userId}`;

/**
 * Menonjolkan bagian penting pada isi notifikasi tanpa mengubah payload backend.
 * Saat ini fokus pada kode tiket, dan tetap fallback ke pola TC-... bila metadata belum ada.
 */
const renderHighlightedMessage = (message, ticketCode) => {
  const value = message || "";
  const code = ticketCode || value.match(/TC-[A-Z0-9-]+/i)?.[0];

  if (!code || !value.includes(code)) return value;

  const parts = value.split(code);

  return parts.map((part, index) => (
    <span key={`${code}-${index}`}>
      {part}
      {index < parts.length - 1 && (
        <Box
          component="span"
          sx={{
            display: "inline",
            fontWeight: 600,
            color: "text.disabled",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          {code}
        </Box>
      )}
    </span>
  ));
};

/**
 * NotificationBell menampilkan badge unread dan dropdown notifikasi user login.
 * Komponen ini mengisolasi fetch/mark-read agar TopMenu tetap fokus pada layout header.
 */
const NotificationBell = ({ user, onShowLoading, onHideLoading }) => {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [hiddenNotificationIds, setHiddenNotificationIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const open = Boolean(anchorEl);
  const visibleNotifications = useMemo(
    () =>
      notifications.filter(
        (item) => !hiddenNotificationIds.includes(Number(item.id)),
      ),
    [hiddenNotificationIds, notifications],
  );

  const visibleUnreadCount = useMemo(
    () => visibleNotifications.filter((item) => !item.is_read).length,
    [visibleNotifications],
  );

  const unreadLabel = useMemo(() => {
    if (visibleUnreadCount > 99) return "99+";
    return visibleUnreadCount;
  }, [visibleUnreadCount]);

  /**
   * Hidden notification disimpan lokal per user.
   * Ini membuat tombol "bersihkan" hanya menghapus dari tampilan, bukan database.
   */
  useEffect(() => {
    if (!user?.id) return;

    try {
      const storedIds = JSON.parse(
        localStorage.getItem(getHiddenStorageKey(user.id)) || "[]",
      );
      setHiddenNotificationIds(
        Array.isArray(storedIds) ? storedIds.map(Number).filter(Boolean) : [],
      );
    } catch {
      setHiddenNotificationIds([]);
    }
  }, [user?.id]);

  /**
   * Mengambil data terbaru dari API. Saat silent=true, proses polling tidak
   * menampilkan spinner agar pengalaman pengguna tetap halus.
   */
  const fetchNotifications = useCallback(
    async ({ silent = false } = {}) => {
      if (!user) return;

      if (!silent) setLoading(true);
      setErrorMessage("");

      try {
        const res = await axios.get("/api/notifications", {
          params: { limit: NOTIFICATION_LIMIT },
        });

        setNotifications(res.data?.data || []);
      } catch (err) {
        const message =
          err.response?.data?.message || "Gagal mengambil notifikasi";
        setErrorMessage(message);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    fetchNotifications({ silent: true });

    const intervalId = setInterval(() => {
      fetchNotifications({ silent: true });
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleClose = () => setAnchorEl(null);

  /**
   * Menandai notifikasi sebagai dibaca sebelum membuka halaman tiket.
   * Update lokal tetap dilakukan agar badge langsung terasa responsif.
   */
  const handleNotificationClick = async (notification) => {
    try {
      await axios.patch("/api/notifications", {
        notification_id: notification.id,
      });

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, is_read: true } : item,
        ),
      );

      const targetUrl =
        notification.metadata?.url ||
        (notification.ticket_id
          ? `/ticket-details/${notification.ticket_id}`
          : null);

      if (
        notification.type === "ticket_deleted_by_user" ||
        notification.metadata?.is_deleted_ticket
      ) {
        handleClose();
        setNotice({
          open: true,
          severity: "warning",
          message:
            "Laporan ini sudah dibatalkan oleh user dan tidak tersedia lagi di detail tiket.",
        });
        return;
      }

      if (targetUrl) {
        if (notification.ticket_id && targetUrl.startsWith("/ticket-details/")) {
          try {
            await axios.get(`/api/ticket-details/${notification.ticket_id}`);
          } catch (err) {
            if (err.response?.status === 404) {
              handleClose();
              setNotice({
                open: true,
                severity: "warning",
                message:
                  "Laporan ini sudah dihapus atau tidak tersedia lagi di sistem.",
              });
              return;
            }

            throw err;
          }
        }

        handleClose();
        onShowLoading?.();
        router.push(targetUrl);
        setTimeout(() => onHideLoading?.(), 800);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Gagal membuka notifikasi",
      );
    }
  };

  /**
   * Aksi cepat untuk membersihkan seluruh badge unread user saat ini.
   */
  const handleMarkAllRead = async () => {
    try {
      await axios.patch("/api/notifications", { mark_all: true });
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, is_read: true })),
      );
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Gagal menandai notifikasi",
      );
    }
  };

  /**
   * Membersihkan daftar yang tampil tanpa menghapus data notifikasi di database.
   * ID disimpan di localStorage agar polling 10 detik tidak menampilkan ulang item lama.
   */
  const handleClearDisplayedNotifications = () => {
    if (!user?.id || visibleNotifications.length === 0) return;

    const visibleIds = visibleNotifications.map((item) => Number(item.id));
    const nextHiddenIds = [
      ...new Set([...hiddenNotificationIds, ...visibleIds]),
    ].slice(-200);

    setHiddenNotificationIds(nextHiddenIds);
    localStorage.setItem(
      getHiddenStorageKey(user.id),
      JSON.stringify(nextHiddenIds),
    );
  };

  return (
    <>
      <Tooltip title="Notifikasi">
        <IconButton
          onClick={handleOpen}
          size="small"
          sx={{
            color: theme.palette.primary.main,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.2),
            },
          }}
        >
          <Badge
            badgeContent={unreadLabel}
            color="error"
            invisible={visibleUnreadCount === 0}
            sx={{
              "& .MuiBadge-badge": {
                minWidth: 17,
                height: 17,
                px: 0.5,
                fontSize: 11,
                fontWeight: 600,
              },
            }}
          >
            <Icon
              icon="line-md:bell-filled-loop"
              color={theme.palette.primary.main}
              fontSize="25px"
            />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        disableScrollLock
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 1.4,
            width: isMobile ? "calc(100vw - 24px)" : 390,
            maxWidth: "calc(100vw - 24px)",
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid rgba(230,9,9,0.12)",
            boxShadow:
              "0 20px 55px rgba(15,23,42,0.18), 0 8px 20px rgba(230,9,9,0.08)",
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            background:
              "linear-gradient(135deg, rgba(230,9,9,0.08) 0%, rgba(255,255,255,1) 55%, rgba(34,197,94,0.08) 100%)",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <FontStyle fontWeight={700} fontSize={17}>
                Notifikasi
              </FontStyle>
              <FontStyle
                fontSize={12}
                fontWeight={500}
                sx={{ color: "text.disabled" }}
              >
                Update tiket dan percakapan terbaru.
              </FontStyle>
            </Box>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                color: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              }}
            >
              <Icon icon="solar:bell-bing-bold-duotone" fontSize={25} />
            </Box>
          </Stack>

          {visibleNotifications.length > 0 && (
            <Stack
              direction="row"
              spacing={1}
              sx={{
                mt: 1.4,
                flexWrap: "wrap",
                rowGap: 1,
              }}
            >
              {visibleUnreadCount > 0 && (
                <Button
                  size="small"
                  onClick={handleMarkAllRead}
                  startIcon={<Icon icon="solar:check-read-bold-duotone" />}
                  sx={{
                    px: 1.35,
                    py: 0.6,
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    "& .MuiButton-startIcon": { mr: 0.6 },
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.14),
                    },
                  }}
                >
                  Tandai dibaca
                </Button>
              )}
              <Button
                size="small"
                onClick={handleClearDisplayedNotifications}
                startIcon={<Icon icon="solar:broom-bold-duotone" />}
                sx={{
                  px: 1.35,
                  py: 0.6,
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  "& .MuiButton-startIcon": { mr: 0.6 },
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.14),
                  },
                }}
              >
                Bersihkan
              </Button>
            </Stack>
          )}
        </Box>

        <Divider />

        {loading ? (
          <Box
            sx={{
              py: 5,
              display: "grid",
              placeItems: "center",
              gap: 1.4,
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                color: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                animation: "notificationPulse 1.15s ease-in-out infinite",
                "@keyframes notificationPulse": {
                  "0%, 100%": {
                    transform: "scale(1)",
                    opacity: 0.75,
                  },
                  "50%": {
                    transform: "scale(1.08)",
                    opacity: 1,
                  },
                },
              }}
            >
              <Icon icon="solar:bell-bing-bold-duotone" fontSize={25} />
            </Box>
            <FontStyle
              fontWeight={700}
              fontSize={12}
              sx={{ color: "text.disabled" }}
            >
              Memuat notifikasi...
            </FontStyle>
          </Box>
        ) : errorMessage ? (
          <Box sx={{ p: 2.4, textAlign: "center" }}>
            <Icon
              icon="solar:danger-triangle-bold-duotone"
              fontSize={42}
              color={theme.palette.primary.main}
            />
            <FontStyle fontWeight={800} fontSize={14} sx={{ mt: 1 }}>
              Notifikasi belum bisa dimuat
            </FontStyle>
            <FontStyle fontSize={12} sx={{ mt: 0.5, color: "text.disabled" }}>
              {errorMessage}
            </FontStyle>
            <Button
              onClick={() => fetchNotifications()}
              size="small"
              variant="contained"
              sx={{ mt: 2, textTransform: "none", fontWeight: 800 }}
            >
              Coba lagi
            </Button>
          </Box>
        ) : visibleNotifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Box
              sx={{
                mx: "auto",
                width: 58,
                height: 58,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.primary.main,
              }}
            >
              <Icon icon="solar:inbox-line-bold-duotone" fontSize={34} />
            </Box>
            <FontStyle fontWeight={600} fontSize={14} sx={{ mt: 1.4 }}>
              Belum ada notifikasi
            </FontStyle>
            <FontStyle fontSize={12} sx={{ mt: 0.4, color: "text.disabled", fontWeight: 500 }}>
              Aktivitas tiket terbaru akan muncul di sini.
            </FontStyle>
          </Box>
        ) : (
          <List
            disablePadding
            sx={{
              maxHeight: 430,
              overflowY: "auto",
              bgcolor: "#fff",
              scrollbarWidth: "thin",
              scrollbarColor: `${alpha(theme.palette.primary.main, 0.38)} ${alpha(
                theme.palette.primary.main,
                0.06,
              )}`,
              "&::-webkit-scrollbar": {
                width: 8,
              },
              "&::-webkit-scrollbar-track": {
                my: 0.7,
                borderRadius: 999,
                backgroundColor: alpha(theme.palette.primary.main, 0.06),
              },
              "&::-webkit-scrollbar-thumb": {
                borderRadius: 999,
                backgroundColor: alpha(theme.palette.primary.main, 0.34),
                border: "2px solid transparent",
                backgroundClip: "padding-box",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.5),
              },
            }}
          >
            {visibleNotifications.map((item) => {
              const icon = TYPE_ICON[item.type] || "solar:bell-bold-duotone";

              return (
                <ListItemButton
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  sx={{
                    alignItems: "flex-start",
                    gap: 1.25,
                    px: 1.6,
                    py: 1.35,
                    borderBottom: "1px solid rgba(15,23,42,0.06)",
                    bgcolor: item.is_read
                      ? "#fff"
                      : alpha(theme.palette.primary.main, 0.045),
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      color: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    }}
                  >
                    <Icon icon={icon} fontSize={24} />
                  </Box>
                  <Box minWidth={0} flex={1}>
                    <Stack
                      direction="row"
                      alignItems="flex-start"
                      spacing={1}
                      sx={{ minWidth: 0 }}
                    >
                      <FontStyle
                        fontWeight={600}
                        fontSize={13}
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          lineHeight: 1.25,
                        }}
                      >
                        {item.title}
                      </FontStyle>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.7}
                        sx={{ flexShrink: 0, pt: 0.1 }}
                      >
                        <FontStyle
                          fontSize={10.5}
                          fontWeight={600}
                          sx={{
                            color: item.is_read
                              ? "text.disabled"
                              : theme.palette.primary.main,
                            lineHeight: 1.2,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.created_at_human}
                        </FontStyle>
                        {!item.is_read && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: theme.palette.primary.main,
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Stack>
                    </Stack>
                    <FontStyle
                      fontSize={12}
                      sx={{
                        mt: 0.35,
                        lineHeight: 1.45,
                        color: "text.disabled",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        fontWeight: 500,
                      }}
                    >
                      {renderHighlightedMessage(
                        item.message,
                        item.metadata?.ticket_code,
                      )}
                    </FontStyle>
                  </Box>
                </ListItemButton>
              );
            })}
          </List>
        )}
      </Popover>

      <Notification
        open={notice.open}
        severity={notice.severity}
        message={notice.message}
        onClose={() => setNotice((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
};

export default NotificationBell;
