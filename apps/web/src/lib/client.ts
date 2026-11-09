import { getDb } from "@appamora/db";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { defaultLocale, hasLocale, LOCALE_COOKIE } from "@/i18n/config";
import { getAuth } from "./auth";
import { accountState, effectiveLimits, type AccountState, type PlanLimits } from "./plans";
import { parseSiteContent, type SiteContent } from "./sites/content";
import type { TemplateId } from "./catalog";

/** Set by the admin's "View as client" button; only honored for admins. */
export const VIEW_AS_COOKIE = "amora_view_as";

async function loginPath() {
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  return `/${saved && hasLocale(saved) ? saved : defaultLocale}/login`;
}

export type ClientContext = {
  user: { id: string; name: string; email: string };
  /** True when the admin is looking at a client's dashboard. */
  viewingAsAdmin: boolean;
  client: {
    id: string;
    name: string;
    slug: string;
    plan: "TRIAL" | "STARTER" | "PRO" | "CUSTOM";
    trialEndsAt: Date;
    paidUntil: Date | null;
    customServices: string[];
  };
  site: { id: string; template: TemplateId; content: SiteContent };
  state: AccountState;
  limits: PlanLimits;
  /** Locked accounts may only change the business name and logo. */
  locked: boolean;
};

/**
 * The client whose dashboard is shown, or a redirect to the login page.
 * Every dashboard page and server action calls this; the proxy's cookie check is only a fast path.
 */
export const requireClient = cache(async (): Promise<ClientContext> => {
  const requestHeaders = await headers();
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  if (!session) redirect(await loginPath());

  const db = getDb();
  let clientId: string | null;
  let viewingAsAdmin = false;
  if (session.user.role === "ADMIN") {
    clientId = (await cookies()).get(VIEW_AS_COOKIE)?.value ?? null;
    if (!clientId) redirect("/admin");
    viewingAsAdmin = true;
  } else {
    const user = await db.user.findUnique({ where: { id: session.user.id }, select: { clientId: true } });
    clientId = user?.clientId ?? null;
  }
  if (!clientId) redirect(`${await loginPath()}?error=forbidden`);

  const client = await db.client.findUnique({ where: { id: clientId }, include: { site: true } });
  if (!client || !client.site) redirect(viewingAsAdmin ? "/admin/clients" : `${await loginPath()}?error=forbidden`);

  const now = new Date();
  const state = accountState(client, now);
  const template = client.site.template as TemplateId;
  return {
    user: { id: session.user.id, name: session.user.name, email: session.user.email },
    viewingAsAdmin,
    client: {
      id: client.id,
      name: client.name,
      slug: client.slug,
      plan: client.plan,
      trialEndsAt: client.trialEndsAt,
      paidUntil: client.paidUntil,
      customServices: client.customServices,
    },
    site: { id: client.site.id, template, content: parseSiteContent(client.site.content, client.name, template) },
    state,
    limits: effectiveLimits(client, state),
    locked: state.kind === "locked",
  };
});
