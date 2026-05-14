import bcrypt from "bcryptjs";

/**
 * ===============================
 * GENERATE RANDOM OTP
 * ===============================
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * ===============================
 * HASH OTP
 * ===============================
 */
export const hashOTP = async (otp) => {
  return await bcrypt.hash(otp, 10);
};

/**
 * ===============================
 * COMPARE OTP
 * ===============================
 */
export const compareOTP = async (
  plainOtp,
  hashedOtp,
) => {
  return await bcrypt.compare(
    plainOtp,
    hashedOtp,
  );
};

/**
 * ===============================
 * OTP EXPIRED TIME
 * ===============================
 */
export const getOTPExpiredTime = () => {
  const expired = new Date();

  expired.setMinutes(
    expired.getMinutes() + 5,
  );

  return expired;
};