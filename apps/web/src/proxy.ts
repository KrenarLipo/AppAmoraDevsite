import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale, LOCALE_COOKIE, type Locale } from "@/i18n/config";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    // Fast path only: without a session cookie, skip rendering and go to login.
    // Pages still verify the session and role on the server.
    if (pathname === "/admin/login" || !getSessionCookie(request)) {
      return NextResponse.redirect(new URL(`/${pickLocale(request)}/login`, request.url));
    }
    return;
  }

  // Visitors without a locale in the URL are redirected to one:
  // the language they picked before (cookie), else their browser language, else English.
  if (hasLocale(pathname.split("/")[1] ?? "")) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${pickLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

function pickLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (saved && hasLocale(saved)) return saved;

  const accepted = (request.headers.get("accept-language") ?? "")
    .split(",")
    .map((part) => {
      const [tag = "", q] = part.trim().split(";q=");
      return { lang: tag.split("-")[0]!.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { lang } of accepted) {
    if (hasLocale(lang)) return lang;
  }
  return defaultLocale;
}

export const config = {
  // Skip Next internals, API routes, uploaded media and files with an extension (sitemap.xml, icon.svg…).
  matcher: ["/((?!api|_next|media/|.*\\..*).*)"],
};
