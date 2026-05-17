"use client";

import { useMemo, useState } from "react";

import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Rating,
  Stack,
  TextField,
  Divider,
  useMediaQuery,
} from "@mui/material";

import { Icon } from "@iconify/react";

import FontStyle from "../font-style/FontStyle";

const TicketRatingSection = ({
  data,
  user,
  loading = false,
  onSubmit,
  DESC_MAX,
  readOnly = false,
}) => {
  const isMobile = useMediaQuery("(max-width: 600px)");

  /**
   * ===============================
   * LOCAL STATE
   * ===============================
   */
  const [rating, setRating] = useState(Number(data?.rating_value) || 0);

  const [comment, setComment] = useState(data?.rating_comment || "");

  /**
   * ===============================
   * RATING LABEL
   * ===============================
   * Hook harus selalu dipanggil sebelum conditional return agar urutan hook stabil.
   */
  const ratingLabel = useMemo(() => {
    switch (rating) {
      case 1:
        return "Sangat Buruk";
      case 2:
        return "Buruk";
      case 3:
        return "Cukup";
      case 4:
        return "Baik";
      case 5:
        return "Sangat Baik";
      default:
        return undefined;
    }
  }, [rating]);

  /**
   * ===============================
   * CHECK OWNER
   * ===============================
   */
  const isTicketOwner = Number(user?.user?.id) === Number(data?.user?.id);

  /**
   * ===============================
   * COMPLETED
   * ===============================
   */
  const isCompleted = data?.status === "selesai";

  /**
   * ===============================
   * ALREADY RATED
   * ===============================
   */
  const alreadyRated = !!data?.rating_value;

  /**
   * ===============================
   * SHOW SECTION
   * ===============================
   */
  /**
   * ===============================
   * ROLE
   * ===============================
   */
  const isUserRole = user?.user?.role === "user";

  const isAdminRole = ["admin", "superadmin"].includes(user?.user?.role);

  /**
   * ===============================
   * SHOW INPUT FORM
   * ===============================
   */
  const canGiveRating =
    !readOnly && isCompleted && isTicketOwner && isUserRole && !alreadyRated;

  /**
   * ===============================
   * SHOW RESULT
   * ===============================
   */
  const showRatingResult =
    isCompleted && alreadyRated && (readOnly || isTicketOwner || isAdminRole);

  /**
   * ===============================
   * HIDE ALL
   * ===============================
   */
  if (!canGiveRating && !showRatingResult) {
    return null;
  }

  /**
   * ===============================
   * HANDLE SUBMIT
   * ===============================
   */
  const handleSubmit = () => {
    if (!rating || loading) return;

    onSubmit?.({
      rating_value: rating,
      rating_comment: comment?.trim(),
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 3,

        p: {
          xs: 2,
          md: 3,
        },

        borderRadius: 4,

        border: "1px solid #FFD54F",

        background:
          "linear-gradient(180deg, rgba(255,193,7,0.04) 0%, rgba(255,255,255,1) 100%)",

        boxShadow: "0 8px 24px rgba(0,0,0,0.05)",

        overflow: "hidden",
      }}
    >
      {/* ===============================
          HEADER
      =============================== */}
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: isMobile ? 56 : 44,
            height: isMobile ? 52 : 44,

            borderRadius: "50%",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            background: "linear-gradient(135deg, #FFB800 0%, #FFD54F 100%)",

            color: "#fff",

            boxShadow: "0 6px 18px rgba(255,184,0,0.25)",
          }}
        >
          <Icon icon="material-symbols:star-rounded" fontSize={28} />
        </Box>

        <Box>
          <FontStyle
            sx={{
              fontSize: 15,
              fontWeight: 700,
              color: "#e9a700",
            }}
          >
            {alreadyRated ? "Penilaian Pengguna" : "Beri Penilaian"}
          </FontStyle>

          <FontStyle
            sx={{
              fontSize: 12,
              color: "text.disabled",
              fontWeight: 500,
              mt: 0.3,
            }}
          >
            {alreadyRated
              ? "Terima kasih atas penilaian yang telah diberikan"
              : "Bagikan pengalaman Anda terhadap penanganan laporan ini"}
          </FontStyle>
        </Box>
      </Stack>

      <Divider sx={{ my: 2.5 }} />

      {/* ===============================
          RATING RESULT
      =============================== */}
      {showRatingResult ? (
        <Box>
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{
              xs: "flex-start",
              sm: "center",
            }}
          >
            <Box
              sx={{
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  width: "100%",
                }}
              >
                <FontStyle
                  sx={{
                    fontSize: 12,
                    fontWeight: "bold",
                    color: "text.disabled",
                    mb: 0.2,
                  }}
                >
                  Penilaian
                </FontStyle>

                <FontStyle
                  sx={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: "text.disabled",
                  }}
                >
                  {data?.rated_at_human || "-"}
                </FontStyle>
              </Box>

              <Rating
                value={Number(data?.rating_value)}
                precision={1}
                readOnly
              />

              <FontStyle
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  mt: 0.5,
                  color:
                    rating > 0 && rating <= 3
                      ? "error.main"
                      : rating > 3 && rating < 5
                        ? "warning.main"
                        : "success.main",
                }}
              >
                {ratingLabel}
              </FontStyle>
            </Box>
          </Stack>

          {data?.rating_comment && (
            <Box
              sx={{
                mt: 2,

                p: 2,

                borderRadius: 3,

                backgroundColor: "#fafafa",

                border: "1px solid rgba(0,0,0,0.20)",
              }}
            >
              <FontStyle
                sx={{
                  fontSize: 12,
                  fontWeight: 500,
                  lineHeight: 1.8,

                  whiteSpace: "pre-wrap",

                  wordBreak: "break-word",
                }}
              >
                {data?.rating_comment}
              </FontStyle>
            </Box>
          )}
        </Box>
      ) : (
        <>
          {/* ===============================
              RATING INPUT
          =============================== */}
          <Box>
            <FontStyle
              sx={{
                fontSize: 12,
                fontWeight: "bold",
                color: "text.disabled",
                mb: 0.2,
              }}
            >
              Pilih rating
            </FontStyle>

            <Rating
              value={rating}
              size="large"
              precision={1}
              onChange={(e, newValue) => {
                setRating(newValue);
              }}
            />
            <FontStyle
              sx={{
                fontSize: 12,
                fontWeight: 600,
                mt: 1,
                color:
                  rating > 0 && rating <= 3
                    ? "error.main"
                    : rating > 3 && rating < 5
                      ? "warning.main"
                      : "success.main",
              }}
            >
              {ratingLabel}
            </FontStyle>
          </Box>

          {/* ===============================
              COMMENT
          =============================== */}
          <Box mt={3}>
            <FontStyle
              sx={{
                fontSize: 12,
                color: "text.disabled",
                fontWeight: 600,
              }}
            >
              Ulasan Singkat (opsional)
            </FontStyle>
            <TextField
              multiline
              rows={4}
              fullWidth
              placeholder="Tulis ulasan Anda disini. . ."
              value={comment}
              onChange={(e) => {
                if (e.target.value.length <= DESC_MAX) {
                  setComment(e.target.value);
                }
              }}
              sx={{
                backgroundColor: "#fff",
                fontWeight: 500,
                fontFamily: "Poppins, sans-serif",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                },
              }}
            />

            <FontStyle
              sx={{
                fontSize: 11,
                fontWeight: "bold",
                fontFamily: "Poppins, sans-serif",
                textAlign: "right",
                mt: 0.8,
                mb: 1,
                color:
                  comment.length >= DESC_MAX
                    ? "error.main"
                    : comment.length >= DESC_MAX * 0.9
                      ? "warning.main"
                      : "text.disabled",
              }}
            >
              {comment?.length <= DESC_MAX
                ? `Karakter tersisa ${DESC_MAX - comment.length}/${DESC_MAX}`
                : `Karakter tersisa ${DESC_MAX * 0.9 - comment.length}/${DESC_MAX}`}
            </FontStyle>
          </Box>

          {/* ===============================
              BUTTON
          =============================== */}
          <Stack direction="row" justifyContent="flex-end" mt={3}>
            <Button
              variant="contained"
              disabled={!rating || loading}
              onClick={handleSubmit}
              sx={{
                minWidth: 180,

                height: 48,

                borderRadius: 3,

                fontWeight: 700,

                textTransform: "none",

                fontSize: 14,

                boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
              }}
            >
              {loading ? "Mengirim..." : "Kirim Penilaian"}
            </Button>
          </Stack>
        </>
      )}
    </Paper>
  );
};

export default TicketRatingSection;
