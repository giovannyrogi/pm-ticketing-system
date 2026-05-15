import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import { Box, Button, Chip, CircularProgress } from "@mui/material";
import { formatNumber } from "@/app/utils/formatNumber";

const PublicTicketsLoadMore = ({
  hasMore,
  loadingMore,
  remainingCount,
  totalCount,
  color,
  loadMoreRef,
  onLoadMore,
}) => {
  if (hasMore) {
    return (
      <Box
        ref={loadMoreRef}
        sx={{
          py: 1.5,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Button
          type="button"
          variant="outlined"
          disabled={loadingMore}
          onClick={onLoadMore}
          sx={{
            px: 2,
            py: 1,
            borderRadius: 2,
            borderColor: "rgba(22, 163, 74, 0.26)",
            bgcolor: "rgba(22, 163, 74, 0.08)",
            color,
            fontFamily: "Poppins, sans-serif",
            fontSize: 12,
            fontWeight: 600,
            textTransform: "none",
            gap: 1,
            "&.Mui-disabled": {
              borderColor: "rgba(22, 163, 74, 0.18)",
              color,
              bgcolor: "rgba(22, 163, 74, 0.06)",
              opacity: 0.86,
            },
            "&:hover": {
              borderColor: "rgba(22, 163, 74, 0.42)",
              bgcolor: "rgba(22, 163, 74, 0.12)",
            },
          }}
        >
          {/* {loadingMore && <CircularProgress size={15} sx={{ color }} />} */}
          {loadingMore
            ? `Memuat ${formatNumber(remainingCount)} laporan berikutnya...`
            : `Muat ${formatNumber(remainingCount)} laporan berikutnya`}
        </Button>
      </Box>
    );
  }

  if (totalCount <= 0 || loadingMore) return null;

  return (
    <Box
      sx={{
        pt: 1,
        pb: 0.5,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Chip
        icon={<VerifiedOutlinedIcon sx={{ fontSize: 16 }} />}
        label="Semua laporan sudah ditampilkan"
        sx={{
          borderRadius: 2,
          bgcolor: "rgba(22, 163, 74, 0.08)",
          color,
          border: "1px solid rgba(22, 163, 74, 0.18)",
          fontFamily: "Poppins, sans-serif",
          fontSize: 12,
          fontWeight: 600,
          "& .MuiChip-icon": {
            color,
          },
        }}
      />
    </Box>
  );
};

export default PublicTicketsLoadMore;
