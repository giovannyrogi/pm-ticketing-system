export const locationFormFields = [
  {
    name: "locationName",
    label: "Nama Lokasi",
    placeholder: "Contoh: Pasar Pinasungkulan Karombasan",
  },
  {
    name: "address",
    label: "Nama Jalan",
    placeholder: "Masukkan alamat atau keterangan lokasi",
  },
];

// Validasi ringan di frontend agar request hanya dikirim ketika data utama terisi.
export const validateLocationForm = (values) => {
  const errors = {};

  if (!values.locationName?.trim()) {
    errors.locationName = "Nama lokasi harus diisi";
  }

  if (!values.address?.trim()) {
    errors.address = "Nama jalan harus diisi";
  }

  return errors;
};
