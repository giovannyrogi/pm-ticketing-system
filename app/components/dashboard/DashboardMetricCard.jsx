"use client";

import FontStyle from "@/app/components/font-style/FontStyle";
import { Icon } from "@iconify/react";
import { Box, Paper } from "@mui/material";

const DashboardMetricCard = ({
  title,
  value,
  helper,
  icon,
  color = "primary.main",
  tone = "rgba(230, 9, 9, 0.08)",
  previousValue,
  percentage,
  background = "#fff",
}) => {
  // Comparison hanya dipakai oleh card yang memang butuh pembanding bulan lalu.
  const previousNumber = Number(
    String(previousValue ?? "")
      .replace(/\./g, "")
      .replace(",", "."),
  );
  const percentageNumber = Number(percentage);
  const hasComparison =
    previousValue !== undefined &&
    previousValue !== null &&
    previousValue !== "";
  const canShowPercentage =
    hasComparison &&
    previousNumber > 0 &&
    Number.isFinite(percentageNumber) &&
    percentage !== null &&
    percentage !== undefined &&
    percentageNumber !== 0;
  const isUp = percentageNumber > 0;
  const percentageColor = isUp ? "success.main" : "error.main";

  return (
    <Paper
      elevation={2}
      sx={{
        height: "100%",
        minHeight: 146,
        p: { xs: 1.5, md: 2 },
        borderRadius: 2.5,
        border: "1px solid rgba(0,0,0,0.10)",
        background,
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 1.2,
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          right: -28,
          bottom: -34,
          width: 108,
          height: 108,
          borderRadius: "50%",
          bgcolor: tone,
          opacity: 0.55,
        }}
      />

      <Box display="flex" justifyContent="space-between" gap={2} zIndex={1}>
        <Box minWidth={0}>
          <FontStyle
            sx={{
              fontSize: { xs: 11, md: 12 },
              fontWeight: 700,
              color: "rgba(35,35,35,0.64)",
              letterSpacing: 0,
            }}
          >
            {title}
          </FontStyle>

          <FontStyle
            sx={{
              mt: 0.8,
              fontSize: { xs: 32, md: 35 },
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: 0,
              color: "#111827",
            }}
          >
            {value}
          </FontStyle>
        </Box>

        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2.3,
            bgcolor: tone,
            color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon icon={icon} fontSize={23} />
        </Box>
      </Box>

      <Box zIndex={1}>
        {hasComparison && (
          <FontStyle
            sx={{
              fontSize: { xs: 11, md: 11.5 },
              fontWeight: 600,
              color: "rgba(35,35,35,0.62)",
              letterSpacing: 0,
              display: "flex",
              alignItems: "center",
              gap: 0.7,
              flexWrap: "wrap",
            }}
          >
            <span>Bulan lalu: {previousValue}</span>

            {canShowPercentage && (
              <Box
                component="span"
                sx={{
                  color: percentageColor,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.25,
                }}
              >
                <Icon
                  icon={isUp ? "mdi:arrow-up" : "mdi:arrow-down"}
                  fontSize={14}
                />
                {Math.abs(percentageNumber)}%
              </Box>
            )}
          </FontStyle>
        )}

        {helper && (
          <FontStyle
            sx={{
              mt: hasComparison ? 0.8 : 0,
              fontSize: { xs: 10.5, md: 11 },
              fontWeight: 700,
              color: "rgba(35,35,35,0.56)",
              letterSpacing: 0,
            }}
          >
            {helper}
          </FontStyle>
        )}
      </Box>
    </Paper>
  );
};

export default DashboardMetricCard;
