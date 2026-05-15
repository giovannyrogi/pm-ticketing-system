"use client";

import DashboardHeader from "@/app/components/dashboard/DashboardHeader";
import DashboardMetricCard from "@/app/components/dashboard/DashboardMetricCard";
import DashboardPanel from "@/app/components/dashboard/DashboardPanel";
import DashboardProgressList from "@/app/components/dashboard/DashboardProgressList";
import DashboardRecentTickets from "@/app/components/dashboard/DashboardRecentTickets";
import DashboardTrendChart from "@/app/components/dashboard/DashboardTrendChart";
import DashboardWorkloadList from "@/app/components/dashboard/DashboardWorkloadList";
import LoadingBackdrop from "@/app/components/loading/Backdrop";
import Notification from "@/app/components/notification/Notification";
import {
  Alert,
  Box,
  Grid,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from "@mui/material";
import { ConfigProvider, theme as antdTheme } from "antd";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";

const formatNumber = (value) =>
  new Intl.NumberFormat("id-ID").format(value || 0);
const AUTO_REFRESH_SECONDS = 180;
const EMPTY_OVERVIEW = {};
const EMPTY_WAITING_REPLY = {};
const EMPTY_ENGAGEMENT = {};
const EMPTY_MONTHLY = {};
const TREND_OPTIONS = [
  { value: "week", label: "Minggu Ini" },
  { value: "month", label: "Bulan Ini" },
  { value: "year", label: "Tahun Ini" },
];

const MONTHLY_HELPER = "Akumulasi bulan berjalan";

const Dashboard = () => {
  const theme = useTheme();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trendPeriod, setTrendPeriod] = useState("week");
  const [refreshCountdown, setRefreshCountdown] =
    useState(AUTO_REFRESH_SECONDS);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Ambil semua data agregasi dashboard dari endpoint protected.
  const getDashboard = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        const res = await axios.get("/api/dashboard/summary");

        if (res.data.success) {
          setDashboard(res.data.data);
          setRefreshCountdown(AUTO_REFRESH_SECONDS);
        } else {
          setDashboard(null);
          setSnackbar({
            open: true,
            message: res.data.message || "Gagal memuat dashboard",
            severity: "error",
          });
        }
      } catch (err) {
        setDashboard(null);
        setSnackbar({
          open: true,
          message: err?.response?.data?.message || "Gagal memuat dashboard",
          severity: "error",
        });
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 700);
      }
    },
    [],
  );

  // Load data hanya saat halaman pertama kali dibuka.
  useEffect(() => {
    getDashboard();
  }, [getDashboard]);

  // Countdown ringan di client untuk auto refresh 3 menit sekali.
  useEffect(() => {
    const countdown = setInterval(() => {
      setRefreshCountdown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  // Saat countdown habis, refresh data tanpa menampilkan backdrop penuh.
  useEffect(() => {
    if (refreshCountdown === 0) {
      getDashboard(false);
    }
  }, [getDashboard, refreshCountdown]);

  const overview = dashboard?.overview || EMPTY_OVERVIEW;
  const waitingReply = dashboard?.waiting_reply || EMPTY_WAITING_REPLY;
  const engagement = dashboard?.engagement || EMPTY_ENGAGEMENT;
  const monthly = dashboard?.monthly || EMPTY_MONTHLY;
  const userSummary = dashboard?.users;
  const isSuperadmin = dashboard?.current_user?.role === "superadmin";
  const countdownMinutes = String(Math.floor(refreshCountdown / 60)).padStart(
    2,
    "0",
  );
  const countdownSeconds = String(refreshCountdown % 60).padStart(2, "0");
  const trendColors = useMemo(
    () => [theme.palette.primary.main, "#16A34A"],
    [theme.palette.primary.main],
  );
  const activeTrend = dashboard?.trend?.[trendPeriod] || dashboard?.trend?.week;

  // Empat card status memakai total keseluruhan status, tanpa pembanding bulan lalu.
  const statusItems = useMemo(
    () => [
      {
        title: "Pending",
        value: overview.pending,
        helper: "Total tiket menunggu diproses",
        icon: "mdi:timer-sand",
        color: "#B7791F",
        tone: "rgba(245, 158, 11, 0.14)",
        background:
          "linear-gradient(135deg, rgba(245,158,11,0.11) 0%, rgba(255,255,255,1) 72%)",
      },
      {
        title: "Diproses",
        value: overview.proses,
        helper: `${formatNumber(overview.assigned_to_me)} sedang kamu tangani`,
        icon: "mdi:progress-clock",
        color: "#2563EB",
        tone: "rgba(37, 99, 235, 0.12)",
        background:
          "linear-gradient(135deg, rgba(37,99,235,0.10) 0%, rgba(255,255,255,1) 72%)",
      },
      {
        title: "Selesai",
        value: overview.selesai,
        helper: "Total tiket berhasil diselesaikan",
        icon: "material-symbols:task-alt-rounded",
        color: "#16A34A",
        tone: "rgba(22, 163, 74, 0.12)",
        background:
          "linear-gradient(135deg, rgba(22,163,74,0.10) 0%, rgba(255,255,255,1) 72%)",
      },
      {
        title: "Ditolak",
        value: overview.ditolak,
        helper: "Total tiket yang tidak dapat diproses",
        icon: "material-symbols:cancel-rounded",
        color: theme.palette.primary.main,
        tone: "rgba(230, 9, 9, 0.1)",
        background:
          "linear-gradient(135deg, rgba(230,9,9,0.10) 0%, rgba(255,255,255,1) 72%)",
      },
    ],
    [overview, theme.palette.primary.main],
  );

  // Data komposisi status untuk progress bar berwarna per status.
  const statusBreakdown = useMemo(
    () => [
      {
        id: "pending",
        name: "Pending",
        total: overview.pending,
        color: "warning.main",
      },
      {
        id: "proses",
        name: "Proses",
        total: overview.proses,
        color: "info.main",
      },
      {
        id: "selesai",
        name: "Selesai",
        total: overview.selesai,
        color: "success.main",
      },
      {
        id: "ditolak",
        name: "Ditolak",
        total: overview.ditolak,
        color: "error.main",
      },
    ],
    [overview],
  );

  const handleTrendPeriodChange = (_, value) => {
    if (value) {
      setTrendPeriod(value);
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <DashboardHeader
        countdownMinutes={countdownMinutes}
        countdownSeconds={countdownSeconds}
      />

      {!loading && !dashboard && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Data dashboard belum dapat dimuat.
        </Alert>
      )}

      {dashboard && (
        <ConfigProvider
          theme={{
            algorithm: antdTheme.defaultAlgorithm,
            token: {
              colorPrimary: theme.palette.primary.main,
              fontFamily: "Poppins, sans-serif",
            },
            components: {
              Table: {
                headerBg: theme.palette.primary.main,
                headerColor: "#fff",
                rowHoverBg: "#f5f5f5",
              },
            },
          }}
        >
          <Stack spacing={2.5}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <DashboardMetricCard
                  title="Total Laporan"
                  value={formatNumber(monthly.total?.current)}
                  helper={MONTHLY_HELPER}
                  previousValue={formatNumber(monthly.total?.previous)}
                  percentage={monthly.total?.percentage}
                  icon="mdi:ticket-confirmation-outline"
                  color={theme.palette.primary.main}
                  tone="rgba(230, 9, 9, 0.1)"
                  background="linear-gradient(135deg, rgba(230,9,9,0.10) 0%, rgba(255,255,255,1) 72%)"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <DashboardMetricCard
                  title="Butuh Balasan Admin"
                  value={formatNumber(waitingReply.admin)}
                  helper={`${formatNumber(waitingReply.user)} menunggu balasan user`}
                  icon="mdi:message-alert-outline"
                  color="#2563EB"
                  tone="rgba(37, 99, 235, 0.12)"
                  background="linear-gradient(135deg, rgba(37,99,235,0.10) 0%, rgba(255,255,255,1) 72%)"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <DashboardMetricCard
                  title="Rating Rata-rata"
                  value={overview.average_rating || 0}
                  helper={`${formatNumber(overview.rating_count)} tiket sudah diberi rating`}
                  icon="material-symbols:star-rate-rounded"
                  color="#B7791F"
                  tone="rgba(245, 158, 11, 0.14)"
                  background="linear-gradient(135deg, rgba(245,158,11,0.14) 0%, rgba(255,255,255,1) 72%)"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <DashboardMetricCard
                  title="Tiket Publik"
                  value={formatNumber(overview.public_tickets)}
                  helper={`${formatNumber(engagement.views)} views, ${formatNumber(engagement.likes)} likes`}
                  icon="mdi:web"
                  color="#16A34A"
                  tone="rgba(22, 163, 74, 0.12)"
                  background="linear-gradient(135deg, rgba(22,163,74,0.10) 0%, rgba(255,255,255,1) 72%)"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              {statusItems.map((item) => (
                <Grid key={item.title} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <DashboardMetricCard
                    title={item.title}
                    value={formatNumber(item.value)}
                    helper={item.helper}
                    previousValue={item.previousValue}
                    percentage={item.percentage}
                    icon={item.icon}
                    color={item.color}
                    tone={item.tone}
                    background={item.background}
                  />
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, lg: 8 }}>
                <DashboardPanel
                  title={`Tren Laporan ${activeTrend?.label || ""}`}
                  subtitle="Perbandingan tiket masuk dan tiket selesai sesuai periode"
                  icon="mdi:chart-areaspline"
                  iconColor={theme.palette.primary.main}
                  iconTone="rgba(230,9,9,0.10)"
                  action={
                    <ToggleButtonGroup
                      exclusive
                      size="small"
                      value={trendPeriod}
                      onChange={handleTrendPeriodChange}
                      sx={{
                        alignSelf: { xs: "stretch", sm: "flex-start" },
                        "& .MuiToggleButton-root": {
                          px: { xs: 1, md: 1.4 },
                          py: 0.6,
                          borderRadius: "8px !important",
                          mx: 0.2,
                          border: "1px solid rgba(0,0,0,0.12)",
                          fontFamily: "Poppins, sans-serif",
                          fontSize: 11,
                          fontWeight: 800,
                          textTransform: "none",
                          color: "rgba(35,35,35,0.64)",
                          "&.Mui-selected": {
                            color: theme.palette.primary.main,
                            bgcolor: "rgba(230, 9, 9, 0.08)",
                          },
                        },
                      }}
                    >
                      {TREND_OPTIONS.map((option) => (
                        <ToggleButton key={option.value} value={option.value}>
                          {option.label}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  }
                >
                  <DashboardTrendChart
                    data={activeTrend?.items || []}
                    colors={trendColors}
                  />
                </DashboardPanel>
              </Grid>

              <Grid size={{ xs: 12, lg: 4 }}>
                <DashboardPanel
                  title="Komposisi Status"
                  subtitle="Distribusi semua tiket berdasarkan status"
                  icon="mdi:chart-donut"
                  iconColor="#7C3AED"
                  iconTone="rgba(124,58,237,0.12)"
                >
                  <DashboardProgressList
                    items={statusBreakdown}
                    valueKey="total"
                    color={theme.palette.primary.main}
                  />
                </DashboardPanel>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <DashboardPanel
                  title="Kategori Terbanyak"
                  subtitle="Kategori laporan dengan volume tertinggi"
                  icon="tabler:category-filled"
                  iconColor="#2563EB"
                  iconTone="rgba(37,99,235,0.12)"
                >
                  <DashboardProgressList
                    items={dashboard.categories || []}
                    valueKey="total"
                    secondaryKey="active"
                    color="#2563EB"
                  />
                </DashboardPanel>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <DashboardPanel
                  title="Lokasi Terbanyak"
                  subtitle="Area yang paling sering masuk laporan"
                  icon="mdi:map-marker-radius"
                  iconColor="#16A34A"
                  iconTone="rgba(22,163,74,0.12)"
                >
                  <DashboardProgressList
                    items={dashboard.locations || []}
                    valueKey="total"
                    secondaryKey="active"
                    color="#16A34A"
                  />
                </DashboardPanel>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, lg: 4 }}>
                <DashboardPanel
                  title="Beban Kerja Admin"
                  subtitle="Tiket aktif, selesai, dan rating per petugas"
                  icon="mdi:account-hard-hat"
                  iconColor="#2563EB"
                  iconTone="rgba(37,99,235,0.12)"
                >
                  <DashboardWorkloadList
                    admins={dashboard.admin_workload || []}
                  />
                </DashboardPanel>
              </Grid>

              <Grid size={{ xs: 12, lg: 8 }}>
                <DashboardPanel
                  title="Tiket Terbaru"
                  subtitle="Laporan terbaru yang masuk ke sistem"
                  icon="mdi:ticket-confirmation"
                  iconColor={theme.palette.primary.main}
                  iconTone="rgba(230,9,9,0.10)"
                >
                  <DashboardRecentTickets
                    tickets={dashboard.recent_tickets || []}
                  />
                </DashboardPanel>
              </Grid>
            </Grid>

            {isSuperadmin && userSummary && (
              <DashboardPanel
                title="Ringkasan User"
                subtitle="Khusus superadmin untuk melihat komposisi akun aktif"
                icon="mdi:account-group"
                iconColor="#7C3AED"
                iconTone="rgba(124,58,237,0.12)"
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <DashboardMetricCard
                      title="Total Akun"
                      value={formatNumber(userSummary.total)}
                      helper="Seluruh akun terdaftar"
                      icon="mdi:account-group-outline"
                      color="#2563EB"
                      tone="rgba(37, 99, 235, 0.12)"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <DashboardMetricCard
                      title="Akun Aktif"
                      value={formatNumber(userSummary.active)}
                      helper="Dapat login dan menggunakan sistem"
                      icon="mdi:account-check-outline"
                      color="#16A34A"
                      tone="rgba(22, 163, 74, 0.12)"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <DashboardMetricCard
                      title="User"
                      value={formatNumber(userSummary.users)}
                      helper="Pelapor layanan"
                      icon="mdi:account-outline"
                      color="#7C3AED"
                      tone="rgba(124, 58, 237, 0.12)"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <DashboardMetricCard
                      title="Admin"
                      value={formatNumber(userSummary.admins)}
                      helper="Admin dan superadmin"
                      icon="mdi:shield-account-outline"
                      color={theme.palette.primary.main}
                      tone="rgba(230, 9, 9, 0.1)"
                    />
                  </Grid>
                </Grid>
              </DashboardPanel>
            )}
          </Stack>
        </ConfigProvider>
      )}

      <LoadingBackdrop open={loading} message="Memuat dashboard..." />
      <Notification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default Dashboard;
