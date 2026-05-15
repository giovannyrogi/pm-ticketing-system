import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import {
  FormControl,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

const PublicTicketFilters = ({
  search,
  onSearchChange,
  location,
  locations,
  onLocationChange,
  category,
  categories,
  onCategoryChange,
  sort,
  sortOptions,
  onSortChange,
}) => {
  return (
    <Grid container spacing={1.5} alignItems="stretch">
      <Grid size={{ xs: 12, md: 5 }}>
        <TextField
          fullWidth
          value={search}
          placeholder="Cari judul, deskripsi, kategori, lokasi..."
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "rgba(35,35,35,0.46)" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            height: "100%",
            "& .MuiOutlinedInput-root": {
              height: "100%",
              minHeight: 52,
              borderRadius: 2,
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
              fontSize: 13,
              bgcolor: "rgba(250,250,250,0.72)",
            },
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 4, md: 2.3 }}>
        <FormControl fullWidth>
          <Select
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            displayEmpty
            sx={{
              minHeight: 52,
              borderRadius: 2,
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
              fontSize: 13,
              bgcolor: "rgba(250,250,250,0.72)",
            }}
          >
            <MenuItem value="all">Semua lokasi</MenuItem>
            {locations.map((item) => (
              <MenuItem key={item.id} value={String(item.id)}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12, sm: 4, md: 2.3 }}>
        <FormControl fullWidth>
          <Select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            displayEmpty
            sx={{
              minHeight: 52,
              borderRadius: 2,
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
              fontSize: 13,
              bgcolor: "rgba(250,250,250,0.72)",
            }}
          >
            <MenuItem value="all">Semua kategori</MenuItem>
            {categories.map((item) => (
              <MenuItem key={item.id} value={String(item.id)}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12, sm: 4, md: 2.4 }}>
        <FormControl fullWidth>
          <Select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            displayEmpty
            IconComponent={TuneIcon}
            sx={{
              minHeight: 52,
              borderRadius: 2,
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
              fontSize: 13,
              bgcolor: "rgba(250,250,250,0.72)",
            }}
          >
            {sortOptions.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default PublicTicketFilters;
