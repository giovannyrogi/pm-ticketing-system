"use client";

import FontStyle from "@/app/components/font-style/FontStyle";
import { Box, LinearProgress, Stack } from "@mui/material";

const DashboardProgressList = ({
  items = [],
  valueKey = "total",
  secondaryKey,
  color = "primary.main",
  emptyText = "Belum ada data",
}) => {
  const maxValue = Math.max(
    ...items.map((item) => Number(item[valueKey]) || 0),
    1,
  );

  if (!items.length) {
    return (
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          border: "1px dashed rgba(0,0,0,0.18)",
          textAlign: "center",
        }}
      >
        <FontStyle
          sx={{ fontSize: 12, fontWeight: 700, color: "text.disabled" }}
        >
          {emptyText}
        </FontStyle>
      </Box>
    );
  }

  return (
    <Stack spacing={1.15}>
      {items.map((item) => {
        const value = Number(item[valueKey]) || 0;
        const percent = Math.round((value / maxValue) * 100);
        const itemColor = item.color || color;

        return (
          <Box
            key={item.id || item.name}
            sx={{
              p: { xs: 1.15, md: 1.25 },
              borderRadius: 2,
              border: "1px solid rgba(15,23,42,0.08)",
              background:
                "linear-gradient(135deg, rgba(248,250,252,0.95) 0%, rgba(255,255,255,1) 72%)",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              gap={2}
              mb={1}
            >
              <Box minWidth={0}>
                <FontStyle
                  sx={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: 0,
                    color: itemColor,
                  }}
                >
                  {item.name || "-"}
                </FontStyle>

                {secondaryKey && (
                  <FontStyle
                    sx={{
                      mt: 0.2,
                      fontSize: 10,
                      fontWeight: 700,
                      color: "rgba(35,35,35,0.52)",
                      letterSpacing: 0,
                    }}
                  >
                    Aktif: {Number(item[secondaryKey]) || 0}
                  </FontStyle>
                )}
              </Box>

              <Box
                sx={{
                  minWidth: 34,
                  height: 28,
                  px: 1,
                  borderRadius: 1.6,
                  color: itemColor,
                  bgcolor: "rgba(15,23,42,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 900,
                  fontSize: 12,
                }}
              >
                {value}
              </Box>
            </Box>

            <LinearProgress
              variant="determinate"
              value={percent}
              sx={{
                height: 8,
                borderRadius: 999,
                bgcolor: "rgba(0,0,0,0.06)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                  bgcolor: itemColor,
                },
              }}
            />
          </Box>
        );
      })}
    </Stack>
  );
};

export default DashboardProgressList;
