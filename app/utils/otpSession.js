const OTP_SESSION_KEY =
  "pmcare_otp_session";

export const saveOTPSession = (
  data,
) => {
  localStorage.setItem(
    OTP_SESSION_KEY,
    JSON.stringify(data),
  );
};

export const getOTPSession =
  () => {
    const data =
      localStorage.getItem(
        OTP_SESSION_KEY,
      );

    return data
      ? JSON.parse(data)
      : null;
  };

export const clearOTPSession =
  () => {
    localStorage.removeItem(
      OTP_SESSION_KEY,
    );
  };