"use client";

import FontStyle from "@/app/components/font-style/FontStyle";
import LoadingBackdrop from "@/app/components/loading/Backdrop";
import StatusTag from "@/app/components/status-tag/StatusTag";
import { useUser } from "@/app/utils/useUser";
import { Icon } from "@iconify/react";
import { Box, Button, Divider, Grid, Paper, Typography } from "@mui/material";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const TicketDetail = () => {
  const { id } = useParams();
  const user = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const getDetail = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`/api/ticket-details/${id}`);

      setTimeout(() => {
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setData(null);
        }

        setLoading(false);
        setInitialized(true);
      }, 1000); // delay biar smooth UX
    } catch (err) {
      console.log("ERROR:", err);

      setTimeout(() => {
        setData(null);
        setLoading(false);
        setInitialized(true);
      }, 1000);
    }
  };

  useEffect(() => {
    if (id) getDetail();
  }, [id]);

  /**
   * ===============================
   * LOADING STATE
   * ===============================
   */
  if (!initialized || loading) {
    return <LoadingBackdrop message="Loading ticket..." open />;
  }

  /**
   * ===============================
   * NOT FOUND
   * ===============================
   */
  if (!data) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          Data tidak ditemukan
        </Typography>
      </Box>
    );
  }

  /**
   * ===============================
   * DATA
   * ===============================
   */
  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2 },
          borderRadius: 3,
          border: "1px solid #eee",
          boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
        }}
      >
        <Grid container spacing={1}>
          {/* HEADER */}
          <Grid size={12}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap={1}
            >
              <FontStyle fontWeight="bold" fontSize={14} color="text.disabled">
                #{data?.ticket_code || "-"}
              </FontStyle>

              <FontStyle fontSize={12} color="text.disabled">
                {data?.created_at_human}
              </FontStyle>
            </Box>
          </Grid>

          <Grid size={12}>
            <Divider />
          </Grid>

          {/* GRID INFO */}
          <Grid container spacing={2} size={12} mt={1}>
            {/* LOKASI */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box display="flex" gap={1}>
                <Icon icon="mdi:map-marker" width={18} color="#9e9e9e" />

                <Box>
                  <FontStyle
                    fontSize={12}
                    fontWeight="bold"
                    color="text.disabled"
                  >
                    Lokasi
                  </FontStyle>
                  <FontStyle fontSize={13} fontWeight="500">
                    {data?.location?.name || "-"}
                  </FontStyle>
                </Box>
              </Box>
            </Grid>

            {/* KATEGORI */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box display="flex" gap={1}>
                <Icon icon="mdi:shape-outline" width={18} color="#9e9e9e" />

                <Box>
                  <FontStyle
                    fontSize={12}
                    fontWeight="bold"
                    color="text.disabled"
                  >
                    Kategori
                  </FontStyle>

                  <StatusTag
                    color={data?.category?.name ? "blue" : "red"}
                    label={data?.category?.name || "-"}
                  />
                </Box>
              </Box>
            </Grid>

            {/* STATUS */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box display="flex" gap={1}>
                <Icon icon="mdi:progress-clock" width={18} color="#9e9e9e" />

                <Box>
                  <FontStyle
                    fontSize={12}
                    fontWeight="bold"
                    color="text.disabled"
                  >
                    Status
                  </FontStyle>

                  <StatusTag label={data?.status || "-"} />
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* SUBJEK */}
          <Grid size={12} mt={2}>
            <FontStyle fontSize={12} fontWeight="bold" color="text.disabled">
              Subjek Tiket
            </FontStyle>

            <FontStyle fontSize={12} fontWeight="600">
              {data?.ticket_title || "-"}
            </FontStyle>
          </Grid>

          {/* DESKRIPSI */}
          <Grid size={12} mt={2}>
            <FontStyle fontSize={12} fontWeight="bold" color="text.disabled">
              Deskripsi
            </FontStyle>

            <Box
              sx={{
                mt: 1,
                p: 1.5,
                borderRadius: 2,
                backgroundColor: "#fafafa",
                border: "1px solid #eee",
              }}
            >
              <FontStyle
                fontSize={13}
                sx={{
                  lineHeight: 1.6,
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                  textAlign: "justify",
                }}
              >
                {data.ticket_description || "-"}
              </FontStyle>
            </Box>
          </Grid>

          {/* GAMBAR */}
          <Grid size={12} mb={1} mt={2}>
            <FontStyle fontSize={12} fontWeight="bold" color="text.disabled">
              Lampiran
            </FontStyle>

            {data.images?.length > 0 ? (
              <Box
                sx={{
                  mt: 1,
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm:
                      data.images.length === 1
                        ? "1fr"
                        : data.images.length === 2
                          ? "1fr 1fr"
                          : "1fr 1fr 1fr",
                  },
                  gap: 2,
                }}
              >
                {data.images.map((img, i) => (
                  <Box
                    key={i}
                    sx={{
                      borderRadius: 2,
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "0.25s",
                      "&:hover": {
                        transform: "scale(1.03)",
                        boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    <img
                      src={img}
                      style={{
                        width: "100%",
                        height: 140,
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  mt: 1,
                  p: 2,
                  border: "1px dashed #ddd",
                  borderRadius: 2,
                  textAlign: "center",
                  color: "text.disabled",
                }}
              >
                <Icon icon="mdi:image-off-outline" width={26} />
                <FontStyle fontSize={12}>Tidak ada gambar</FontStyle>
              </Box>
            )}
          </Grid>

          <Divider
            sx={{
              width: "100%",
            }}
          />

          <Grid size={12} align="right">
            <FontStyle fontSize={12} color="text.disabled" fontWeight="500">
              {`${data?.user?.name || "-"}`}
            </FontStyle>
          </Grid>

          {/* <Grid size={12}>
            <Button variant="contained">asdsad</Button>
          </Grid> */}

          {/* ACTION BUTTON (ADMIN ONLY) */}
          {/* {user?.role === "admin" ||
            (user?.role === "superadmin" && (
              <Grid size={12}>
                <Button variant="contained">asdsad</Button>
              </Grid>
            ))} */}
        </Grid>
      </Paper>
    </Box>
  );
};

export default TicketDetail;
