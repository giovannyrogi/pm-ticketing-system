import {
  removeSpaces,
  validateAuthEmail,
  validateAuthPassword,
  validateFullName,
  validateUsername,
} from "@/app/utils/authValidation";
import {
  sanitizePhoneNumber,
  validatePhoneNumber,
} from "@/app/utils/validationTextField";
import { roleOptions } from "./constants";

// Konfigurasi field dipusatkan agar create dan edit memakai struktur input yang sama.
export const getUserFormFields = (formMode) => [
  {
    name: "fullName",
    label: "Nama lengkap",
    fullWidth: true,
  },
  {
    name: "username",
    label: "Username",
    sanitize: removeSpaces,
  },
  {
    name: "email",
    label: "Email",
    sanitize: (value) => removeSpaces(value).toLowerCase(),
  },
  {
    name: "phoneNumber",
    label: "Nomor WhatsApp",
    prefix: "+62",
    sanitize: sanitizePhoneNumber,
  },
  {
    name: "role",
    label: "Role",
    type: "select",
    options: roleOptions,
  },
  {
    name: "password",
    label: formMode === "edit" ? "Password baru (opsional)" : "Password",
    type: "password",
    fullWidth: true,
  },
  {
    name: "isActive",
    label: "Status akun",
    type: "switch",
    helperText: "Akun aktif dapat login dan menggunakan sistem.",
  },
];

// Validasi mengikuti util auth/phone yang sudah dipakai project.
export const validateUserForm = (values, formMode) => {
  const nextErrors = {
    fullName: validateFullName(values.fullName),
    username: validateUsername(values.username),
    email: validateAuthEmail(values.email),
    phoneNumber: values.phoneNumber
      ? validatePhoneNumber(values.phoneNumber)
      : "Nomor telepon harus diisi",
    password:
      formMode !== "edit" || values.password
        ? validateAuthPassword(values.password)
        : "",
  };

  Object.keys(nextErrors).forEach((key) => {
    if (!nextErrors[key]) delete nextErrors[key];
  });

  return nextErrors;
};

export const validateDeleteForm = (values) =>
  values.confirmation === "HAPUS"
    ? {}
    : { confirmation: "Ketik HAPUS untuk melanjutkan" };
