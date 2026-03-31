import { NextResponse } from "next/server";
import { ROUTE_ACCESS } from "./app/components/menu/routeAccess";

/**
 * ===============================
 * PUBLIC & AUTH ROUTES
 * ===============================
 */
const PUBLIC_ROUTES = ["/"];
const AUTH_ROUTES = ["/login", "/register"];

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
    if (route.path === "/") return pathname === "/";
    return pathname.startsWith(route.path);
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
    if (!PUBLIC_ROUTES.includes(pathname) && !AUTH_ROUTES.includes(pathname)) {
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
    if (AUTH_ROUTES.includes(pathname)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    /**
     * ===============================
     * ROLE BASED ACCESS (DYNAMIC)
     * ===============================
     */
    const matchedRoute = getMatchedRoute(pathname);

    if (matchedRoute) {
      const allowedRoles = matchedRoute.roles;

      if (!allowedRoles.includes(user.role)) {
        return NextResponse.redirect(new URL("/", request.url));
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
