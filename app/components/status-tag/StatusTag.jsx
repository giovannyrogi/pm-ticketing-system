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
  proses: "blue",
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
        fontSize: 12,
        fontWeight: "bold",
        textTransform: "capitalize",
        borderRadius: 6,
        padding: "2px 8px",
      }}
    >
      {label}
    </Tag>
  );
};

export default StatusTag;
