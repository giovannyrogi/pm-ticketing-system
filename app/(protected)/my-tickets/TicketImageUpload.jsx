import FontStyle from "@/app/components/font-style/FontStyle";
import { Icon } from "@iconify/react";
import { Box, Chip, Stack } from "@mui/material";
import { alpha } from "@mui/material/styles";
import Image from "next/image";

const TicketImageUpload = ({
  uploadId,
  images,
  maxImages = 3,
  onChange,
  onPreview,
  onRemove,
  theme,
}) => {
  const canAddMore = images.length < maxImages;

  return (
    <Box sx={{ gridColumn: "1 / -1" }}>
      <Stack
        direction={{ xs: "row", sm: "row" }}
        spacing={1}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 1.2 }}
      >
        <Box>
          <FontStyle sx={{ fontSize: 12, fontWeight: 600 }}>
            Upload Gambar (Opsional)
          </FontStyle>
          <FontStyle
            sx={{
              mt: 0.25,
              fontSize: 10,
              fontWeight: 600,
              color: theme.palette.primary.main,
            }}
          >
            Maksimal 3 gambar, ukuran 3MB. Format: JPG, PNG.
          </FontStyle>
        </Box>
        <Chip
          size="small"
          label={`${images.length}/${maxImages} gambar`}
          sx={{
            height: 25,
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.primary.main,
            fontFamily: "Poppins, sans-serif",
            fontSize: 11,
            fontWeight: 600,
          }}
        />
      </Stack>

      <Box
        sx={{
          p: 1.3,
          borderRadius: 2,
          border: "1px solid rgba(15,23,42,0.08)",
          bgcolor: "rgba(248,250,252,0.74)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))",
          gap: 1.2,
        }}
      >
        {images.map((item) => (
          <Box
            key={item.key}
            sx={{
              position: "relative",
              aspectRatio: "1 / 1",
              minHeight: 92,
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid rgba(15,23,42,0.10)",
              boxShadow: "0 10px 20px rgba(15,23,42,0.08)",
              bgcolor: "#fff",
            }}
          >
            <Box
              onClick={() => onPreview(item.src)}
              sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                cursor: "pointer",
              }}
            >
              <Image
                src={item.src}
                alt="preview"
                fill
                unoptimized
                sizes="110px"
                style={{ objectFit: "cover" }}
                loading="eager"
              />
            </Box>
            <Box
              onClick={(event) => {
                event.stopPropagation();
                onRemove(item);
              }}
              sx={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 24,
                height: 24,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                color: "#fff",
                bgcolor: "rgba(15,23,42,0.72)",
                cursor: "pointer",
                boxShadow: "0 6px 14px rgba(15,23,42,0.22)",
                transition: "0.2s",
                "&:hover": {
                  bgcolor: theme.palette.primary.main,
                },
              }}
            >
              <Icon icon="mdi:close" fontSize={16} />
            </Box>
          </Box>
        ))}

        {canAddMore && (
          <Box component="label" htmlFor={uploadId} sx={{ cursor: "pointer" }}>
            <Box
              sx={{
                aspectRatio: "1 / 1",
                minHeight: 92,
                borderRadius: 2,
                border: `1.5px dashed ${alpha(theme.palette.primary.main, 0.42)}`,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.035),
                color: theme.palette.primary.main,
                transition: "0.2s",
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  transform: "translateY(-1px)",
                  boxShadow: "0 10px 20px rgba(230,9,9,0.10)",
                },
              }}
            >
              <Stack spacing={0.5} alignItems="center">
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 1.8,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  }}
                >
                  <Icon icon="solar:gallery-add-bold-duotone" fontSize={23} />
                </Box>
                <FontStyle sx={{ fontSize: 11, fontWeight: 900 }}>
                  Tambah
                </FontStyle>
              </Stack>
            </Box>
          </Box>
        )}

        <input
          id={uploadId}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={onChange}
        />
      </Box>
    </Box>
  );
};

export default TicketImageUpload;
