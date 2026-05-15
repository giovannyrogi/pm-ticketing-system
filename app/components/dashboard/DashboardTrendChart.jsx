"use client";

import { Box } from "@mui/material";
import { useEffect, useRef } from "react";

const DashboardTrendChart = ({ data = [], colors = ["#E60909", "#16A34A"] }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      if (!chartRef.current) return;

      const ApexCharts = (await import("apexcharts")).default;

      if (!isMounted) return;

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const labels = data.map((item) => item.label);
      const created = data.map((item) => Number(item.created) || 0);
      const completed = data.map((item) => Number(item.completed) || 0);

      chartInstanceRef.current = new ApexCharts(chartRef.current, {
        chart: {
          type: "area",
          height: 310,
          toolbar: {
            show: false,
          },
          zoom: {
            enabled: false,
          },
          fontFamily: "Poppins, sans-serif",
        },
        colors,
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "smooth",
          width: 3,
        },
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 0.9,
            opacityFrom: 0.28,
            opacityTo: 0.04,
            stops: [0, 90, 100],
          },
        },
        grid: {
          borderColor: "rgba(15,23,42,0.08)",
          strokeDashArray: 4,
          padding: {
            left: 8,
            right: 8,
          },
        },
        markers: {
          size: 4,
          strokeWidth: 3,
          hover: {
            size: 6,
          },
        },
        series: [
          {
            name: "Masuk",
            data: created,
          },
          {
            name: "Selesai",
            data: completed,
          },
        ],
        xaxis: {
          categories: labels,
          labels: {
            rotate: 0,
            trim: true,
            style: {
              colors: "#667085",
              fontSize: "11px",
              fontWeight: 700,
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
        },
        yaxis: {
          min: 0,
          forceNiceScale: true,
          labels: {
            style: {
              colors: "#667085",
              fontSize: "11px",
              fontWeight: 700,
            },
          },
        },
        legend: {
          show: true,
          position: "top",
          horizontalAlign: "right",
          fontSize: "12px",
          fontWeight: 700,
          markers: {
            size: 6,
          },
        },
        tooltip: {
          theme: "light",
          shared: true,
          intersect: false,
        },
        responsive: [
          {
            breakpoint: 600,
            options: {
              chart: {
                height: 260,
              },
              legend: {
                position: "bottom",
                horizontalAlign: "center",
              },
              xaxis: {
                labels: {
                  rotate: -35,
                  rotateAlways: true,
                },
              },
            },
          },
        ],
      });

      chartInstanceRef.current.render();
    };

    renderChart();

    return () => {
      isMounted = false;
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data, colors]);

  return (
    <Box
      sx={{
        minHeight: { xs: 260, md: 310 },
        width: "100%",
        "& .apexcharts-canvas": {
          maxWidth: "100%",
        },
      }}
    >
      <Box ref={chartRef} />
    </Box>
  );
};

export default DashboardTrendChart;
