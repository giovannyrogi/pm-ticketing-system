"use client";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import "moment/locale/id";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ExpiredSessionModal from "../expiredsessionmodal/page";
import { ThemeProvider } from "@mui/material";
import theme from "../theme/theme";
moment.locale("id");

const SESSION_CHECK_INTERVAL = 1000; // cek tiap 1 detik
const SESSION_MODAL_COUNTDOWN = 10; // 10 detik countdown manual
const SESSION_COOKIE_NAME = "dataUser";

export default function AppProviders({ children }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [counter, setCounter] = useState(SESSION_MODAL_COUNTDOWN);

  const getCookie = (name) => {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? decodeURIComponent(match[2]) : null;
  };

  // --- interval global untuk cek session tiap detik
  useEffect(() => {
    const interval = setInterval(() => {
      const cookie = getCookie(SESSION_COOKIE_NAME);
      if (!cookie) return;

      let user;
      try {
        user = JSON.parse(cookie);
      } catch (err) {
        console.error(err);
        return;
      }

      const now = Date.now();

      if (user.expiresAt <= now && !showModal) {
        // session expired → tampilkan modal & mulai countdown
        setShowModal(true);
        setCounter(SESSION_MODAL_COUNTDOWN);
      }
    }, SESSION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [showModal]);

  const endExpiredSession = useCallback(() => {
    document.cookie = `${SESSION_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    setShowModal(false);
    router.push("/login");
  }, [router]);

  // --- countdown modal 10 detik
  useEffect(() => {
    if (!showModal) return;

    const timer = setTimeout(
      () => {
        if (counter <= 0) {
          endExpiredSession();
          return;
        }

        setCounter((prev) => prev - 1);
      },
      counter <= 0 ? 0 : 1000,
    );

    return () => clearTimeout(timer);
  }, [showModal, counter, endExpiredSession]);

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="id">
        {children}
        <ExpiredSessionModal
          open={showModal}
          counter={counter}
          onClose={endExpiredSession}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
}
