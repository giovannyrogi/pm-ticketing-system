import pool from "@/lib/dbConfig";
import { sanitizePhoneNumber } from "@/app/utils/validationTextField";
import { NextResponse } from "next/server";

export const FORGOT_PASSWORD_OTP_TYPE = "forgot_password";

export const jsonError = (message, status = 400, extra = {}) =>
  NextResponse.json(
    {
      success: false,
      message,
      ...extra,
    },
    { status },
  );

export const findActiveUserByIdentifier = async (identifier = "") => {
  const value = identifier.trim().toLowerCase();
  const sanitizedPhoneNumber = sanitizePhoneNumber(value);
  const isPhoneLookup = /^\d+$/.test(value);

  if (!value) return null;

  if (isPhoneLookup && sanitizedPhoneNumber.length < 10) return null;

  const res = await pool.query(
    `
      SELECT id, full_name, username, email, phone_number, is_active
      FROM users
      WHERE is_active = TRUE
      AND (
        LOWER(username) = $1
        OR LOWER(email) = $1
        OR ($3::boolean = TRUE AND phone_number = $2)
      )
      LIMIT 1
    `,
    [value, sanitizedPhoneNumber, isPhoneLookup],
  );

  return res.rows[0] || null;
};

export const maskEmail = (email = "") => {
  const [name, domain] = email.split("@");

  if (!name || !domain) return "-";

  const visible = name.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(name.length - 2, 3))}@${domain}`;
};

export const maskPhoneNumber = (phoneNumber = "") => {
  const sanitized = sanitizePhoneNumber(phoneNumber);

  if (!sanitized) return "-";

  return `+62 ${sanitized.slice(0, 3)}****${sanitized.slice(-3)}`;
};

export const toForgotPasswordPublicUser = (user) => ({
  id: user.id,
  full_name: user.full_name,
  username: user.username,
  email: maskEmail(user.email),
  phone_number: maskPhoneNumber(user.phone_number),
});
