const sanitizeFileName = (name) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, "_")        // spasi → _
    .replace(/[^a-z0-9_]/g, ""); // hapus karakter aneh
};

export default sanitizeFileName;