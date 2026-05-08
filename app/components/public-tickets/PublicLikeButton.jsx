"use client";

import { Box, Button, Tooltip, Typography } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useState } from "react";
import FontStyle from "../font-style/FontStyle";

const PublicLikeButton = ({ initialLikes = 0 }) => {
  const [liked, setLiked] = useState(false);

  return (
    <Tooltip title="Fitur login untuk menyukai laporan akan dihubungkan berikutnya">
      <Box display="inline-flex">
        <Button
          variant={liked ? "contained" : "outlined"}
          color="error"
          onClick={() => setLiked((prev) => !prev)}
          startIcon={liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
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
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0,
            }}
          >
            {(initialLikes || 0) + (liked ? 1 : 0)} Suka
          </FontStyle>
        </Button>
      </Box>
    </Tooltip>
  );
};

export default PublicLikeButton;
