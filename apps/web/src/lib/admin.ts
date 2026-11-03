import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { defaultLocale, hasLocale, LOCALE_COOKIE } from "@/i18n/config";
import { getAuth } from "./auth";

export type AdminUser = { id: string; name: string; email: string };

/** The login page in the visitor's last-used language. */
async function loginPath() {
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  return `/${saved && hasLocale(saved) ? saved : defaultLocale}/login`;
}

/**
 * The signed-in admin, or a redirect to the login page.
 * Every admin page and server action calls this: the proxy's cookie check is only a fast path.
 */
export const requireAdmin = cache(async (): Promise<AdminUser> => {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) redirect(await loginPath());
  if (session.user.role !== "ADMIN") redirect(`${await loginPath()}?error=forbidden`);
  return { id: session.user.id, name: session.user.name, email: session.user.email };
});
