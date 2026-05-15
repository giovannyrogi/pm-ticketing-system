"use client";

import PublicTicketCard from "@/app/components/public-tickets/PublicTicketCard";
import PublicHero from "@/app/components/public-tickets/PublicHero";
import PublicSectionPanel from "@/app/components/public-tickets/PublicSectionPanel";
import PublicSummaryCard from "@/app/components/public-tickets/PublicSummaryCard";
import PublicTicketFilters from "@/app/components/public-tickets/PublicTicketFilters";
import PublicTicketsEmptyState from "@/app/components/public-tickets/PublicTicketsEmptyState";
import PublicTicketsLoadMore from "@/app/components/public-tickets/PublicTicketsLoadMore";
import {
  LOAD_MORE_DELAY,
  PAGE_SIZE,
  PUBLIC_GREEN,
  PUBLIC_RED,
  SORT_OPTIONS,
} from "@/app/components/public-tickets/publicPageConstants";
import { formatNumber } from "@/app/utils/formatNumber";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import { Alert, Box, Chip, Grid, Stack } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LoadingBackdrop from "../components/loading/Backdrop";

const Home = () => {
  const theme = useTheme();
  const loadMoreRef = useRef(null);
  const loadMoreLockRef = useRef(false);
  const loadMoreTimerRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [location, setLocation] = useState("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [allTickets, setAllTickets] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  const getPublicTickets = async () => {
    try {
      setLoading(true);

      setErrorMessage("");

      const res = await axios.get("/api/public/tickets/ticket-list");

      if (res.data.success) {
        setAllTickets(res.data.data || []);

        setCategories(res.data.filters?.categories || []);
      } else {
        setAllTickets([]);

        setErrorMessage(res.data.message || "Gagal mengambil tiket publik");
      }
    } catch (err) {
      console.log("ERROR PUBLIC TICKETS:", err);

      setAllTickets([]);

      setErrorMessage(
        err?.response?.data?.message || "Gagal mengambil tiket publik",
      );
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  useEffect(() => {
    getPublicTickets();
  }, []);

  const resetVisibleTickets = () => {
    if (loadMoreTimerRef.current) {
      clearTimeout(loadMoreTimerRef.current);
      loadMoreTimerRef.current = null;
    }

    loadMoreLockRef.current = false;
    setLoadingMore(false);
    setVisibleCount(PAGE_SIZE);
  };

  const tickets = useMemo(() => {
    let filtered = [...allTickets];

    /**
     * =========================
     * SEARCH
     * =========================
     */
    if (search.trim()) {
      const keyword = search.toLowerCase();

      filtered = filtered.filter((ticket) => {
        return (
          ticket.ticket_title?.toLowerCase().includes(keyword) ||
          ticket.ticket_description?.toLowerCase().includes(keyword) ||
          ticket.ticket_code?.toLowerCase().includes(keyword) ||
          ticket.category?.name?.toLowerCase().includes(keyword) ||
          ticket.location?.name?.toLowerCase().includes(keyword)
        );
      });
    }

    /**
     * =========================
     * CATEGORY
     * =========================
     */
    if (category !== "all") {
      filtered = filtered.filter(
        (ticket) => String(ticket.category?.id) === String(category),
      );
    }

    /**
     * =========================
     * LOCATION
     * =========================
     */
    if (location !== "all") {
      filtered = filtered.filter(
        (ticket) => String(ticket.location?.id) === String(location),
      );
    }

    /**
     * =========================
     * SORTING
     * =========================
     */
    switch (sort) {
      case "oldest":
        filtered.sort(
          (a, b) => new Date(a.published_at) - new Date(b.published_at),
        );
        break;

      case "popular":
        filtered.sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0));
        break;

      case "liked":
        filtered.sort((a, b) => (b.stats?.likes || 0) - (a.stats?.likes || 0));
        break;

      default:
        filtered.sort(
          (a, b) => new Date(b.published_at) - new Date(a.published_at),
        );
    }

    return filtered;
  }, [allTickets, search, category, location, sort]);

  const locations = useMemo(() => {
    const locationMap = new Map();

    allTickets.forEach((ticket) => {
      const item = ticket.location;

      if (item?.id && !locationMap.has(String(item.id))) {
        locationMap.set(String(item.id), item);
      }
    });

    return Array.from(locationMap.values()).sort((a, b) =>
      (a.name || "").localeCompare(b.name || "", "id"),
    );
  }, [allTickets]);

  const summary = useMemo(() => {
    return {
      tickets: allTickets.length,
      categories: categories.length,
      locations: locations.length,
    };
  }, [allTickets, categories, locations]);

  const activeCategoryName = useMemo(() => {
    if (category === "all") return "Semua kategori";

    return (
      categories.find((item) => String(item.id) === String(category))?.name ||
      "Kategori dipilih"
    );
  }, [categories, category]);

  const activeLocationName = useMemo(() => {
    if (location === "all") return "Semua lokasi";

    return (
      locations.find((item) => String(item.id) === String(location))?.name ||
      "Lokasi dipilih"
    );
  }, [locations, location]);

  const filterDescription =
    category === "all" && location === "all"
      ? "Menampilkan semua kategori dan semua lokasi berdasarkan pilihan filter saat ini."
      : `Menampilkan ${activeCategoryName.toLowerCase()} di ${activeLocationName.toLowerCase()}.`;

  const displayedTickets = useMemo(
    () => tickets.slice(0, visibleCount),
    [tickets, visibleCount],
  );

  const hasMoreTickets = displayedTickets.length < tickets.length;

  const loadMoreTickets = useCallback(() => {
    if (loadMoreLockRef.current) return;

    loadMoreLockRef.current = true;
    setLoadingMore(true);

    loadMoreTimerRef.current = window.setTimeout(() => {
      setVisibleCount((current) => {
        if (current >= tickets.length) return current;

        return Math.min(current + PAGE_SIZE, tickets.length);
      });

      setLoadingMore(false);
      loadMoreLockRef.current = false;
      loadMoreTimerRef.current = null;
    }, LOAD_MORE_DELAY);
  }, [tickets.length]);

  useEffect(() => {
    return () => {
      if (loadMoreTimerRef.current) {
        clearTimeout(loadMoreTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !hasMoreTickets || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMoreTickets();
        }
      },
      { rootMargin: "0px 0px 80px 0px", threshold: 0.4 },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [hasMoreTickets, loadMoreTickets, loading, loadingMore]);

  const summaryCards = [
    {
      title: "Laporan Publik",
      value: formatNumber(summary.tickets),
      helper: "Tiket selesai yang sudah dipublikasi",
      icon: <VerifiedOutlinedIcon />,
      color: PUBLIC_GREEN,
      tone: "rgba(22, 163, 74, 0.12)",
      background:
        "linear-gradient(135deg, rgba(22,163,74,0.10) 0%, rgba(255,255,255,1) 72%)",
    },
    {
      title: "Kategori",
      value: formatNumber(summary.categories),
      helper: "Jenis laporan yang tersedia",
      icon: <CategoryOutlinedIcon />,
      color: "#B7791F",
      tone: "rgba(245, 158, 11, 0.14)",
      background:
        "linear-gradient(135deg, rgba(245,158,11,0.13) 0%, rgba(255,255,255,1) 72%)",
    },
    {
      title: "Lokasi Terlapor",
      value: formatNumber(summary.locations),
      helper: "Area pasar atau area wisata dalam laporan publik",
      icon: <LocationOnOutlinedIcon />,
      color: PUBLIC_RED,
      tone: "rgba(230, 9, 9, 0.10)",
      background:
        "linear-gradient(135deg, rgba(230,9,9,0.10) 0%, rgba(255,255,255,1) 72%)",
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1180,
        mx: "auto",
        pb: { xs: 4, md: 6 },
      }}
    >
      <PublicHero />

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {summaryCards.map((item) => (
          <Grid key={item.title} size={{ xs: 12, sm: 6, md: 4 }}>
            <PublicSummaryCard {...item} />
          </Grid>
        ))}
      </Grid>

      <Stack spacing={2}>
        <PublicSectionPanel
          title="Temukan Laporan"
          subtitle="Saring laporan berdasarkan kata kunci, kategori, lokasi, dan urutan publikasi."
          icon={<FilterAltOutlinedIcon />}
          iconColor={theme.palette.primary.main}
          iconTone={alpha(theme.palette.primary.main, 0.1)}
          action={
            <Chip
              label={`${formatNumber(tickets.length)} hasil ditampilkan`}
              sx={{
                fontFamily: "Poppins, sans-serif",
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.primary.main,
                fontSize: 12,
                fontWeight: 600,
              }}
            />
          }
        >
          <Box sx={{ p: { xs: 1.5, md: 2 } }}>
            <PublicTicketFilters
              search={search}
              onSearchChange={(value) => {
                resetVisibleTickets();
                setSearch(value);
              }}
              location={location}
              locations={locations}
              onLocationChange={(value) => {
                resetVisibleTickets();
                setLocation(value);
              }}
              category={category}
              categories={categories}
              onCategoryChange={(value) => {
                resetVisibleTickets();
                setCategory(value);
              }}
              sort={sort}
              sortOptions={SORT_OPTIONS}
              onSortChange={(value) => {
                resetVisibleTickets();
                setSort(value);
              }}
            />
          </Box>
        </PublicSectionPanel>

        <PublicSectionPanel
          title="Laporan Terpublikasi"
          subtitle={filterDescription}
          icon={<VerifiedOutlinedIcon />}
          iconColor="#16A34A"
          iconTone="rgba(22, 163, 74, 0.12)"
        >
          <Box
            sx={{
              p: { xs: 1.5, md: 2 },
              background:
                "linear-gradient(180deg, rgba(250,250,250,0.72) 0%, rgba(255,255,255,1) 36%)",
            }}
          >
            <Stack spacing={1.5}>
              {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

              {loading ? undefined : tickets.length === 0 ? (
                <PublicTicketsEmptyState color={theme.palette.primary.main} />
              ) : (
                displayedTickets.map((ticket) => (
                  <PublicTicketCard key={ticket.id} ticket={ticket} />
                ))
              )}

              {!loading && (
                <PublicTicketsLoadMore
                  hasMore={hasMoreTickets}
                  loadingMore={loadingMore}
                  remainingCount={tickets.length - displayedTickets.length}
                  totalCount={tickets.length}
                  color={PUBLIC_GREEN}
                  loadMoreRef={loadMoreRef}
                  onLoadMore={loadMoreTickets}
                />
              )}
            </Stack>
          </Box>
        </PublicSectionPanel>
      </Stack>
      <LoadingBackdrop open={loading} message="Memuat data..." />
    </Box>
  );
};

export default Home;
