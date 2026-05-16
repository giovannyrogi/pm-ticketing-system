/**
 * ===============================
 * EMAIL REGEX
 * ===============================
 */
export const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * ===============================
 * PHONE REGEX
 * ===============================
 */
export const phoneRegex =
  /^8[0-9]{9,13}$/;

/**
 * ===============================
 * VALIDATE EMAIL
 * ===============================
 */
export const validateEmail = (value = "") => {
  if (!value) return "";

  return emailRegex.test(String(value))
    ? ""
    : "Format email tidak valid";
};

/**
 * ===============================
 * SANITIZE PHONE
 * ===============================
 */
export const sanitizePhoneNumber = (value = "") => {
  let result = String(value ?? "").replace(/\D/g, "");

  if (result.startsWith("0")) {
    result = result.slice(1);
  }

  if (result.startsWith("62")) {
    result = result.slice(2);
  }

  return result.slice(0, 14);
};

/**
 * ===============================
 * VALIDATE PHONE
 * ===============================
 */
export const validatePhoneNumber = (value = "") => {
  if (!value) return "";

  return phoneRegex.test(value)
    ? ""
    : "Nomor telepon harus diawali angka 8 dan terdiri dari 10-14 digit";
};
