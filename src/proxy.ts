import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isStudentRoute = nextUrl.pathname.startsWith("/student");

  if (!isLoggedIn && (isAdminRoute || isStudentRoute)) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/student", nextUrl));
  }

  if (isStudentRoute && role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", nextUrl));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/student/:path*"],
};
