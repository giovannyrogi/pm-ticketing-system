export const emptyLocationForm = {
  locationName: "",
  address: "",
};

export const getLocationFormValues = (mode, location) =>
  mode === "edit" && location
    ? {
        locationName: location.location_name || "",
        address: location.address || "",
      }
    : emptyLocationForm;
