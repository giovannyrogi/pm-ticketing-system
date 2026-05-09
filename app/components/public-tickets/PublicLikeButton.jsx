"use client";

import FontStyle from "../font-style/FontStyle";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { Box, Button, CircularProgress, useTheme } from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

const PublicLikeButton = ({
  ticketId,
  initialLikes = 0,
  initialLiked = false,
  isLoggedIn = false,
}) => {
  const router = useRouter();

  const [liked, setLiked] = useState(initialLiked);

  const [likesCount, setLikesCount] = useState(initialLikes);

  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    /**
     * ===============================
     * REDIRECT LOGIN
     * ===============================
     */
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("/api/public/tickets/toggle-like", {
        ticket_id: ticketId,
      });

      if (res.data.success) {
        setTimeout(() => {
          setLoading(false);
          setLiked(res.data.data.liked);

          setLikesCount(res.data.data.likes_count);
        }, 2000);
      } else {
        setTimeout(() => {
          console.log("error", res);

          setLoading(false);
        }, 1000);
      }
    } catch (err) {
      console.log("ERROR LIKE:", err);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <Box display="inline-flex">
      <Button
        variant={liked ? "contained" : "outlined"}
        color="error"
        onClick={handleLike}
        disabled={loading}
        startIcon={
          loading ? (
            <CircularProgress size={16} color="inherit" />
          ) : liked ? (
            <FavoriteIcon />
          ) : (
            <FavoriteBorderIcon />
          )
        }
        sx={{
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 700,
          fontFamily: "Poppins, sans-serif",
          px: 2,
        }}
      >
        <FontStyle
          sx={{
            fontFamily: "Poppins, sans-serif",
            fontSize: 12,
            fontWeight: 700,
            color: liked ? "#fff" : "error.main",
          }}
        >
          {likesCount} Suka
        </FontStyle>
      </Button>
    </Box>
  );
};

export default PublicLikeButton;
