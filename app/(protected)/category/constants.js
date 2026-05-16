export const emptyCategoryForm = {
  categoryName: "",
};

export const getCategoryFormValues = (mode, category) =>
  mode === "edit" && category
    ? {
        categoryName: category.category_name || "",
      }
    : emptyCategoryForm;
