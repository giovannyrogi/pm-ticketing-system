"use client";

import PublicTicketCard from "@/app/components/public-tickets/PublicTicketCard";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import FontStyle from "../components/font-style/FontStyle";
import LoadingBackdrop from "../components/loading/Backdrop";

const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru dipublish" },
  { value: "oldest", label: "Terlama dipublish" },
  { value: "popular", label: "Paling banyak dilihat" },
  { value: "liked", label: "Paling banyak disukai" },
];

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [allTickets, setAllTickets] = useState([]);

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
  }, [allTickets, search, category, sort]);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1080,
        mx: "auto",
        pb: 6,
      }}
    >
      <Box
        sx={{
          pt: { xs: 2, md: 3 },
          pb: { xs: 2, md: 3 },
        }}
      >
        <FontStyle
          sx={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: "bold",
            fontSize: "20px",
            lineHeight: 1.25,
            textAlign: "center",
            letterSpacing: 0,
          }}
        >
          Selamat datang, PMCare adalah layanan pengaduan masyarakat!
        </FontStyle>

        <FontStyle
          sx={{
            mt: 1,
            mx: "auto",
            maxWidth: 720,
            fontFamily: "Poppins, sans-serif",
            fontSize: "14px",
            lineHeight: 1.7,
            textAlign: "center",
            color: "text.disabled",
            letterSpacing: 0,
            fontWeight: 500,
          }}
        >
          Jelajahi laporan yang telah selesai ditangani dan dipublish sebagai
          informasi yang mungkin Anda butuhkan.
        </FontStyle>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, md: 2 },
          mb: 2,
          borderRadius: 2,
          border: "1px solid rgba(0,0,0,0.14)",
          bgcolor: "background.paper",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <TextField
            fullWidth
            value={search}
            placeholder="Cari judul, deskripsi, kategori, lokasi..."
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.disabled" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontFamily: "Poppins, sans-serif",
                fontWeight: 500,
                fontSize: 14,
              },
            }}
          />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ width: { xs: "100%", md: "auto" } }}
          >
            <FormControl sx={{ minWidth: { xs: "100%", sm: 190 } }}>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                displayEmpty
                sx={{
                  borderRadius: 2,
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                  fontSize: 14,
                }}
              >
                <MenuItem value="all">Semua kategori</MenuItem>
                {categories.map((item) => (
                  <MenuItem key={item.id} value={String(item.id)}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: { xs: "100%", sm: 210 } }}>
              <Select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                displayEmpty
                IconComponent={TuneIcon}
                sx={{
                  borderRadius: 2,
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                  fontSize: 14,
                }}
              >
                {SORT_OPTIONS.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </Paper>

      <Stack spacing={1.5}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        {loading ? undefined : tickets.length === 0 ? ( // </Box> //   <CircularProgress /> // > //   }} //     justifyContent: "center", //     alignItems: "center", //     display: "flex", //     py: 8, //   sx={{ // <Box
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
                fontWeight: 800,
                fontSize: 16,
                letterSpacing: 0,
              }}
            >
              Belum ada laporan publik
            </FontStyle>
            <FontStyle
              sx={{
                mt: 0.75,
                fontFamily: "Poppins, sans-serif",
                fontSize: 13,
                color: "text.disabled",
                letterSpacing: 0,
              }}
            >
              Coba ubah kata kunci atau filter yang digunakan.
            </FontStyle>
          </Paper>
        ) : (
          tickets.map((ticket) => (
            <PublicTicketCard key={ticket.id} ticket={ticket} />
          ))
        )}
      </Stack>
      <LoadingBackdrop open={loading} message="Memuat data..." />
    </Box>
  );
};

export default Home;
