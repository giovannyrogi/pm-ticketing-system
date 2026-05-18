"use client";

import { Box } from "@mui/material";
import { useEffect, useRef } from "react";

const formatNumber = (value) =>
  new Intl.NumberFormat("id-ID").format(Number(value) || 0);

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
      const tooltipLabels = data.map(
        (item) => item.tooltip_label || item.label,
      );
      const created = data.map((item) => Number(item.created) || 0);
      const completed = data.map((item) => Number(item.completed) || 0);
      const highestValue = Math.max(...created, ...completed, 0);
      const yAxisMax = highestValue === 0 ? 4 : Math.ceil(highestValue * 1.25);

      chartInstanceRef.current = new ApexCharts(chartRef.current, {
        chart: {
          type: "area",
          height: 330,
          parentHeightOffset: 0,
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
          width: 3.2,
          lineCap: "round",
        },
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 0.9,
            opacityFrom: 0.34,
            opacityTo: 0.03,
            stops: [0, 90, 100],
          },
        },
        grid: {
          borderColor: "rgba(15,23,42,0.08)",
          strokeDashArray: 4,
          padding: {
            top: 8,
            left: 10,
            right: 10,
            bottom: 2,
          },
        },
        markers: {
          size: 4.5,
          strokeWidth: 2.5,
          strokeColors: "#fff",
          hover: {
            size: 7,
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
            trim: false,
            hideOverlappingLabels: true,
            style: {
              colors: "#667085",
              fontSize: "11.5px",
              fontWeight: 600,
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          tooltip: {
            enabled: false,
          },
        },
        yaxis: {
          min: 0,
          max: yAxisMax,
          tickAmount: 4,
          forceNiceScale: true,
          labels: {
            formatter: (value) => formatNumber(value),
            style: {
              colors: "#667085",
              fontSize: "11.5px",
              fontWeight: 600,
            },
          },
        },
        legend: {
          show: true,
          position: "top",
          horizontalAlign: "right",
          fontSize: "12.5px",
          fontWeight: 600,
          labels: {
            colors: "#1F2937",
          },
          markers: {
            size: 7,
          },
        },
        tooltip: {
          theme: "light",
          shared: true,
          intersect: false,
          x: {
            formatter: (_, opts) =>
              tooltipLabels[opts?.dataPointIndex] || labels[opts?.dataPointIndex] || "",
          },
          y: {
            formatter: (value) => `${formatNumber(value)} tiket`,
            title: {
              formatter: (seriesName) => `${seriesName}: `,
            },
          },
          marker: {
            show: true,
          },
        },
        states: {
          hover: {
            filter: {
              type: "lighten",
              value: 0.02,
            },
          },
        },
        responsive: [
          {
            breakpoint: 900,
            options: {
              chart: {
                height: 300,
              },
              legend: {
                horizontalAlign: "left",
              },
            },
          },
          {
            breakpoint: 600,
            options: {
              chart: {
                height: 270,
              },
              grid: {
                padding: {
                  left: 2,
                  right: 2,
                },
              },
              legend: {
                position: "bottom",
                horizontalAlign: "center",
              },
              xaxis: {
                labels: {
                  rotate: -28,
                  rotateAlways: false,
                  style: {
                    fontSize: "10px",
                  },
                },
              },
              markers: {
                size: 3.5,
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
        minHeight: { xs: 270, md: 330 },
        width: "100%",
        "& .apexcharts-canvas": {
          maxWidth: "100%",
        },
        "& .apexcharts-tooltip": {
          borderRadius: "10px !important",
          border: "1px solid rgba(15,23,42,0.12) !important",
          boxShadow: "0 12px 28px rgba(15,23,42,0.14) !important",
          fontFamily: "Poppins, sans-serif !important",
        },
        "& .apexcharts-tooltip-title": {
          fontWeight: "600 !important",
          color: "#1F2937 !important",
          background: "#F8FAFC !important",
          borderBottom: "1px solid rgba(15,23,42,0.08) !important",
        },
      }}
    >
      <Box ref={chartRef} />
    </Box>
  );
};

export default DashboardTrendChart;
