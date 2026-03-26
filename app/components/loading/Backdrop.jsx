"use client";

import React from "react";
import { Backdrop, Typography, useTheme } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function LoadingBackdrop({
  open = false,
  message = "Loading...",
  zIndex = 999999,
  LogoType = "black",
  ...props
}) {
  const theme = useTheme();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop-wrapper"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex,
            pointerEvents: "auto", // FIX: tidak bolong & tidak bisa diklik
          }}
        >
          <Backdrop
            open={open}
            sx={{
              zIndex,
              backgroundColor: "rgba(255, 255, 255, 0.49)", // lebih gelap dan lembut
              backdropFilter: "blur(3px)", // blur kuat
              // WebkitBackdropFilter: "blur(10px)",
            }}
            {...props}
          >
            {/* CONTENT */}
            <motion.div
              key="loader-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }} // smooth hide
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
                justifyContent: "center",
                alignItems: "center",
                pointerEvents: "none", // konten tidak perlu interaksi
              }}
            >
              {/* LOGO + SPINNER */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                style={{
                  position: "relative",
                  width: 120,
                  height: 120,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress
                  size={120}
                  thickness={1.4}
                  sx={{
                    position: "absolute",
                    color: theme.palette.primary.main,
                    opacity: 0.9,
                  }}
                />

                {LogoType === "black" ? (
                  <Image
                    src="/logo-w-black.png"
                    alt="Loading Logo"
                    width={95}
                    height={95}
                    style={{
                      zIndex: 2,
                      filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))",
                    }}
                  />
                ) : (
                  <Image
                    src="/logo-w-white.png"
                    alt="Loading Logo"
                    width={95}
                    height={95}
                    style={{
                      zIndex: 2,
                      filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))",
                    }}
                  />
                )}
              </motion.div>

              {/* MESSAGE */}
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      color: theme.palette.primary.main,
                      textAlign: "center",
                      letterSpacing: 0.3,
                    }}
                  >
                    {message}
                  </Typography>
                </motion.div>
              )}
            </motion.div>
          </Backdrop>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
