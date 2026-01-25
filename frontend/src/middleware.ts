import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/signup");
  const isPublicRoute = nextUrl.pathname === "/health" || nextUrl.pathname.startsWith("/api/auth");

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/tasks", nextUrl));
    }
    return;
  }

  if (!isLoggedIn && !isPublicRoute && nextUrl.pathname !== "/login") {
    return Response.redirect(new URL("/login", nextUrl));
  }

  return;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

