const ACCOUNT_PHONE_OTP_SESSION_KEY = "pmcare_account_phone_otp_session";

export const saveAccountPhoneOTPSession = (data) => {
  localStorage.setItem(ACCOUNT_PHONE_OTP_SESSION_KEY, JSON.stringify(data));
};

export const getAccountPhoneOTPSession = () => {
  const data = localStorage.getItem(ACCOUNT_PHONE_OTP_SESSION_KEY);

  return data ? JSON.parse(data) : null;
};

export const clearAccountPhoneOTPSession = () => {
  localStorage.removeItem(ACCOUNT_PHONE_OTP_SESSION_KEY);
};
