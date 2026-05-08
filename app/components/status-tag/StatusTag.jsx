"use client";

import React from "react";
import { Tag } from "antd";

/**
 * preset warna antd
 */
const PRESET_COLORS = [
  "magenta",
  "red",
  "volcano",
  "orange",
  "gold",
  "lime",
  "green",
  "cyan",
  "blue",
  "geekblue",
  "purple",
  
];

/**
 * mapping khusus (optional, biar konsisten)
 */
const STATUS_COLOR_MAP = {
  pending: "gold",
  proses: "geekblue",
  selesai: "green",
  ditolak: "red",
};

/**
 * ambil warna random
 */
const getRandomColor = () => {
  return PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
};

const StatusTag = ({
  label,
  color,
  variant = "outlined",
  useRandom = false,
  fontSize = 12,
}) => {
  /**
   * PRIORITY WARNA:
   * 1. props color
   * 2. mapping status
   * 3. random
   */
  const finalColor =
    color ||
    STATUS_COLOR_MAP[label?.toLowerCase()] ||
    (useRandom ? getRandomColor() : "default");

  return (
    <Tag
      color={finalColor}
      variant={variant}
      style={{
        fontSize: fontSize,
        fontWeight: "bold",
        textTransform: "capitalize",
        fontFamily: "Poppins, sans-serif",
        borderRadius: 6,
        padding: "2px 8px",
        letterSpacing: 0.5,
      }}
    >
      {label}
    </Tag>
  );
};

export default StatusTag;
