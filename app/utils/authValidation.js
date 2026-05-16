import { emailRegex } from "@/app/utils/validationTextField";

export const AUTH_VALIDATION_LIMITS = {
  fullNameMin: 3,
  fullNameMax: 100,
  usernameMin: 3,
  usernameMax: 30,
  passwordMin: 6,
  passwordMax: 72,
  emailMax: 254,
};

const toText = (value = "") => String(value ?? "");

export const removeSpaces = (value = "") => toText(value).replace(/\s/g, "");

const hasWhitespace = (value = "") => /\s/.test(toText(value));

export const validateFullName = (value = "") => {
  const fullName = toText(value).trim();

  if (!fullName) return "Nama lengkap harus diisi";
  if (fullName.length < AUTH_VALIDATION_LIMITS.fullNameMin) {
    return `Nama lengkap minimal ${AUTH_VALIDATION_LIMITS.fullNameMin} karakter`;
  }
  if (fullName.length > AUTH_VALIDATION_LIMITS.fullNameMax) {
    return `Nama lengkap maksimal ${AUTH_VALIDATION_LIMITS.fullNameMax} karakter`;
  }

  return "";
};

export const validateUsername = (value = "") => {
  const username = toText(value).trim();

  if (!username) return "Username harus diisi";
  if (hasWhitespace(username)) return "Username tidak boleh memakai spasi";
  if (username.length < AUTH_VALIDATION_LIMITS.usernameMin) {
    return `Username minimal ${AUTH_VALIDATION_LIMITS.usernameMin} karakter`;
  }
  if (username.length > AUTH_VALIDATION_LIMITS.usernameMax) {
    return `Username maksimal ${AUTH_VALIDATION_LIMITS.usernameMax} karakter`;
  }

  return "";
};

export const validateAuthEmail = (value = "") => {
  const email = toText(value).trim();

  if (!email) return "Email harus diisi";
  if (hasWhitespace(email)) return "Email tidak boleh memakai spasi";
  if (email.length > AUTH_VALIDATION_LIMITS.emailMax) {
    return `Email maksimal ${AUTH_VALIDATION_LIMITS.emailMax} karakter`;
  }

  return emailRegex.test(email) ? "" : "Format email tidak valid";
};

export const validateAuthPassword = (value = "", label = "Password") => {
  const password = toText(value);

  if (!password) return `${label} harus diisi`;
  if (hasWhitespace(password)) return `${label} tidak boleh memakai spasi`;
  if (password.length < AUTH_VALIDATION_LIMITS.passwordMin) {
    return `${label} minimal ${AUTH_VALIDATION_LIMITS.passwordMin} karakter`;
  }
  if (password.length > AUTH_VALIDATION_LIMITS.passwordMax) {
    return `${label} maksimal ${AUTH_VALIDATION_LIMITS.passwordMax} karakter`;
  }

  return "";
};

export const validatePasswordConfirmation = (
  password = "",
  confirmation = "",
) => {
  const confirmationError = validateAuthPassword(
    confirmation,
    "Konfirmasi password",
  );

  if (confirmationError) return confirmationError;
  if (password !== confirmation) return "Konfirmasi password tidak sesuai";

  return "";
};
