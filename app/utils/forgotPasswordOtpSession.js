const FORGOT_PASSWORD_OTP_SESSION_KEY = "pmcare_forgot_password_otp_sessions";

const readStore = () => {
  const data = sessionStorage.getItem(FORGOT_PASSWORD_OTP_SESSION_KEY);

  if (!data) {
    return {
      activeAccountId: null,
      sessions: {},
    };
  }

  const parsed = JSON.parse(data);

  if (parsed?.sessions) return parsed;

  if (parsed?.account?.id) {
    return {
      activeAccountId: String(parsed.account.id),
      sessions: {
        [parsed.account.id]: parsed,
      },
    };
  }

  return {
    activeAccountId: null,
    sessions: {},
  };
};

const writeStore = (store) => {
  sessionStorage.setItem(FORGOT_PASSWORD_OTP_SESSION_KEY, JSON.stringify(store));
};

const isExpired = (session) =>
  !session?.expiredAt || new Date() > new Date(session.expiredAt);

export const saveForgotPasswordOTPSession = (data) => {
  if (!data?.account?.id) return;

  const store = readStore();
  const accountId = String(data.account.id);

  store.sessions[accountId] = data;
  store.activeAccountId = accountId;

  writeStore(store);
};

export const getForgotPasswordOTPSessionByAccountId = (accountId) => {
  if (!accountId) return null;

  const store = readStore();
  const key = String(accountId);
  const session = store.sessions[key];

  if (isExpired(session)) {
    delete store.sessions[key];

    if (store.activeAccountId === key) {
      store.activeAccountId = null;
    }

    writeStore(store);
    return null;
  }

  store.activeAccountId = key;
  writeStore(store);

  return session;
};

export const getForgotPasswordOTPSession = () => {
  const store = readStore();
  const session = store.sessions[String(store.activeAccountId)];

  if (isExpired(session)) {
    clearForgotPasswordOTPSession(store.activeAccountId);
    return null;
  }

  return session || null;
};

export const clearForgotPasswordOTPSession = (accountId) => {
  if (!accountId) {
    sessionStorage.removeItem(FORGOT_PASSWORD_OTP_SESSION_KEY);
    return;
  }

  const store = readStore();
  const key = String(accountId);

  delete store.sessions[key];

  if (store.activeAccountId === key) {
    store.activeAccountId = null;
  }

  writeStore(store);
};
