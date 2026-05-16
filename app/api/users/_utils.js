import {
  validateAuthEmail,
  validateAuthPassword,
  validateFullName,
  validateUsername,
} from "@/app/utils/authValidation";
import {
  phoneRegex,
  sanitizePhoneNumber,
} from "@/app/utils/validationTextField";
import { getAuthUser, jsonError, toPublicUser } from "@/app/api/account/_utils";

export const USER_ROLES = ["user", "admin", "superadmin"];

export const requireSuperadmin = async (req) => {
  const auth = await getAuthUser(req);

  if (auth.error) {
    return { error: jsonError(auth.error, auth.status), user: null };
  }

  if (auth.user.role !== "superadmin") {
    return {
      error: jsonError("Akses hanya untuk superadmin", 403),
      user: auth.user,
    };
  }

  return { user: auth.user };
};

export const sanitizeUserPayload = (payload = {}) => {
  const fullName = String(payload.fullName ?? payload.full_name ?? "").trim();
  const username = String(payload.username ?? "").trim();
  const email = String(payload.email ?? "").trim().toLowerCase();
  const phoneNumber = sanitizePhoneNumber(
    payload.phoneNumber ?? payload.phone_number ?? "",
  );
  const role = String(payload.role ?? "user").trim().toLowerCase();
  const isActive =
    typeof payload.isActive === "boolean"
      ? payload.isActive
      : typeof payload.is_active === "boolean"
        ? payload.is_active
        : true;

  return { fullName, username, email, phoneNumber, role, isActive };
};

export const validateUserPayload = ({
  fullName,
  username,
  email,
  phoneNumber,
  role,
  password,
  requirePassword = false,
}) => {
  const validationMessage =
    validateFullName(fullName) ||
    validateUsername(username) ||
    validateAuthEmail(email);

  if (validationMessage) return validationMessage;

  if (!phoneNumber) return "Nomor telepon harus diisi";
  if (!phoneRegex.test(phoneNumber)) {
    return "Nomor telepon harus diawali angka 8 dan terdiri dari 10-14 digit";
  }

  if (!USER_ROLES.includes(role)) return "Role akun tidak valid";

  if (requirePassword || password) {
    const passwordValidation = validateAuthPassword(password);
    if (passwordValidation) return passwordValidation;
  }

  return "";
};

export const toAdminUser = (user) => toPublicUser(user);
