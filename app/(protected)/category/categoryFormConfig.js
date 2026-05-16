export const categoryFormFields = [
  {
    name: "categoryName",
    label: "Nama Kategori",
    placeholder: "Contoh: Listrik & Air",
  },
];

// Validasi ringan di frontend agar request hanya dikirim ketika data utama terisi.
export const validateCategoryForm = (values) => {
  const errors = {};

  if (!values.categoryName?.trim()) {
    errors.categoryName = "Nama kategori harus diisi";
  }

  return errors;
};
