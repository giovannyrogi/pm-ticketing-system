import { NextResponse } from "next/server";
import {
  DEFAULT_ROUTE_BY_ROLE,
  PUBLIC_ROUTE_PREFIXES,
  ROUTE_ACCESS,
} from "./app/components/menu/routeAccess";

/**
 * ===============================
 * PUBLIC & AUTH ROUTES
 * ===============================
 */

const AUTH_ROUTES = ["/login", "/register"];
/**
 * ===============================
 * FUNCTION GET DEFAULT ROUTE
 * ===============================
 * Menentukan halaman utama berdasarkan role user.
 */
const getDefaultRouteByRole = (role) => {
  return DEFAULT_ROUTE_BY_ROLE[role] || "/";
};

/**
 * ===============================
 * FUNCTION CHECK PUBLIC ROUTE
 * ===============================
 * Route public menggunakan prefix agar nanti mudah menambah halaman public baru.
 */
const isPublicRoute = (pathname) => {
  return PUBLIC_ROUTE_PREFIXES.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname === route || pathname.startsWith(`${route}/`);
  });
};

/**
 * ===============================
 * FUNCTION MATCH ROUTE (DYNAMIC SUPPORT)
 * ===============================
 */
const getMatchedRoute = (pathname) => {
  const sorted = [...ROUTE_ACCESS].sort(
    (a, b) => b.path.length - a.path.length,
  );

  return sorted.find((route) => {
    return pathname === route.path || pathname.startsWith(`${route.path}/`);
  });
};

export function middleware(request) {
  const { pathname } = request.nextUrl;

  /**
   * ===============================
   * GET USER FROM COOKIE
   * ===============================
   */
  const cookie = request.cookies.get("dataUser");

  let user = null;

  if (cookie) {
    try {
      user = JSON.parse(cookie.value);
    } catch (err) {
      console.error("Invalid cookie format");
    }
  }

  const isLoggedIn = !!user;
  const matchedRoute = getMatchedRoute(pathname);
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  /**
   * ===============================
   * CHECK EXPIRED SESSION
   * ===============================
   */
  if (user?.expiresAt && user.expiresAt < Date.now()) {
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.delete("dataUser");
    return res;
  }

  /**
   * ===============================
   * NOT LOGIN
   * ===============================
   */
  if (!isLoggedIn) {
    /**
     * ===============================
     * ONLY PROTECT REGISTERED ROUTES
     * ===============================
     * Halaman public tetap bebas akses, route protected wajib login.
     */
    if (matchedRoute && !isAuthRoute && !isPublicRoute(pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  /**
   * ===============================
   * ALREADY LOGIN
   * ===============================
   */
  if (isLoggedIn) {
    // block login/register kalau sudah login
    if (isAuthRoute) {
      return NextResponse.redirect(
        new URL(getDefaultRouteByRole(user.role), request.url),
      );
    }

    /**
     * ===============================
     * ROLE BASED ACCESS (DYNAMIC)
     * ===============================
     * Kalau user login membuka route protected yang tidak sesuai role,
     * arahkan ke halaman default role masing-masing.
     */
    if (matchedRoute) {
      const allowedRoles = matchedRoute.roles;

      if (!allowedRoles.includes(user.role)) {
        return NextResponse.redirect(
          new URL(getDefaultRouteByRole(user.role), request.url),
        );
      }
    }
  }

  return NextResponse.next();
}

/**
 * ===============================
 * MATCHER
 * ===============================
 */
export const config = {
  matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"],
};
