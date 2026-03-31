import { getCookie } from "./cookies";

export const updateUserCookie = (updatedFields) => {
  const current = getCookie("dataUser");
  if (!current) return null;

  let parsed;
  try {
    parsed = JSON.parse(current);
  } catch {
    return null;
  }

  const mergedUser = {
    ...parsed,
    ...updatedFields,
  };

  document.cookie = `dataUser=${encodeURIComponent(
    JSON.stringify(mergedUser)
  )}; path=/; SameSite=Strict`;

  // TRIGGER GLOBAL EVENT
  window.dispatchEvent(
    new CustomEvent("user-cookie-updated", {
      detail: mergedUser,
    })
  );

  return mergedUser;
};
