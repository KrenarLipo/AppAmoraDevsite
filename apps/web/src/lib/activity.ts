import { getDb } from "@appamora/db";
import { after } from "next/server";
import type { ClientContext } from "./client";
import { sendEmail } from "./email";
import { accountState, planNames } from "./plans";
import { readSiteInfoForEdit } from "./settings/admin";
import { siteConfig } from "./site";

// Records what clients do and emails about it:
// - the admin, about every client's website changes and payments;
// - paying clients (not the free trial), confirming their changes and payments.
// Website changes are grouped: at most one email per client every 30 minutes, and each
// email lists everything changed since the previous one (the admin sees all activity anyway).

export type ActivityArea = "design" | "home" | "pages" | "details" | "payment" | "account";

const GROUP_MS = 30 * 60_000;

async function adminEmail(): Promise<string> {
  return process.env.ADMIN_NOTIFY_EMAIL || (await readSiteInfoForEdit()).contact.email;
}

type Lang = "en" | "it" | "sq";
const clientCopy: Record<
  Lang,
  { changesSubject: string; changesIntro: string; open: string; paidSubject: string; paidLine: (plan: string, until: string) => string; passwordSubject: string; passwordLine: string }
> = {
  en: {
    changesSubject: "Your website was updated",
    changesIntro: "Your changes are now live on your website:",
    open: "Open your website",
    paidSubject: "Payment received, thank you!",
    paidLine: (plan, until) => `We received your payment for the ${plan} plan. Your website is paid until ${until}.`,
    passwordSubject: "Your AppAmora password was changed",
    passwordLine: "The password of your AppAmora account was just changed. If this wasn't you, reply to this email right away.",
  },
  it: {
    changesSubject: "Il tuo sito è stato aggiornato",
    changesIntro: "Le tue modifiche sono ora online sul tuo sito:",
    open: "Apri il tuo sito",
    paidSubject: "Pagamento ricevuto, grazie!",
    paidLine: (plan, until) => `Abbiamo ricevuto il tuo pagamento per il piano ${plan}. Il tuo sito è pagato fino al ${until}.`,
    passwordSubject: "La tua password AppAmora è stata cambiata",
    passwordLine: "La password del tuo account AppAmora è appena stata cambiata. Se non sei stato tu, rispondi subito a questa email.",
  },
  sq: {
    changesSubject: "Faqja juaj u përditësua",
    changesIntro: "Ndryshimet tuaja janë tani në faqen tuaj:",
    open: "Hapni faqen tuaj",
    paidSubject: "Pagesa u mor, faleminderit!",
    paidLine: (plan, until) => `E morëm pagesën tuaj për planin ${plan}. Faqja juaj është e paguar deri më ${until}.`,
    passwordSubject: "Fjalëkalimi juaj në AppAmora u ndryshua",
    passwordLine: "Fjalëkalimi i llogarisë suaj AppAmora sapo u ndryshua. Nëse nuk ishit ju, përgjigjuni menjëherë këtij email-i.",
  },
};

async function clientInfo(clientId: string) {
  const client = await getDb().client.findUnique({
    where: { id: clientId },
    include: { users: { select: { email: true } }, site: { select: { content: true } } },
  });
  if (!client) return null;
  const language = (client.site?.content as { defaultLanguage?: string } | null)?.defaultLanguage;
  const lang: Lang = language === "it" || language === "sq" ? language : "en";
  return { client, emails: client.users.map((u) => u.email), lang, siteUrl: `${siteConfig.url}/s/${client.slug}` };
}

/** Logs a website change and, after the response is sent, emails about it (grouped). */
export async function recordActivity(ctx: ClientContext, area: ActivityArea, summary: string) {
  const actor = ctx.viewingAsAdmin ? "admin" : "client";
  await getDb().clientActivity.create({ data: { clientId: ctx.client.id, area, summary, actor } });
  // Changes the admin makes while viewing as the client don't send emails.
  if (actor === "admin") return;
  if (area === "account") {
    // A security notice for every plan, to the person whose password changed.
    after(async () => {
      const info = await clientInfo(ctx.client.id);
      const t = clientCopy[info?.lang ?? "en"];
      await sendEmail({ to: ctx.user.email, subject: t.passwordSubject, lines: [t.passwordLine] });
    });
    return;
  }
  after(() => notifyChanges(ctx.client.id).catch((error) => console.error("Change notification failed", error)));
}

const WEBSITE_AREAS = ["design", "home", "pages", "details"];

/** Section names for the client's email, in their language. */
const areaNames: Record<Lang, Record<string, string>> = {
  en: { design: "Design (template, name, logo, colors)", home: "Home page", pages: "Pages", details: "Contact details and languages" },
  it: { design: "Design (modello, nome, logo, colori)", home: "Home page", pages: "Pagine", details: "Contatti e lingue" },
  sq: { design: "Dizajni (shablloni, emri, logoja, ngjyrat)", home: "Kryefaqja", pages: "Faqet", details: "Kontaktet dhe gjuhët" },
};

async function areasSince(clientId: string, since: Date | null, now: Date, lang: Lang): Promise<string[]> {
  const recent = await getDb().clientActivity.findMany({
    where: { clientId, actor: "client", area: { in: WEBSITE_AREAS }, createdAt: { gt: since ?? new Date(now.getTime() - 86_400_000) } },
    select: { area: true },
  });
  return WEBSITE_AREAS.filter((a) => recent.some((r) => r.area === a)).map((a) => `• ${areaNames[lang][a]}`);
}

async function changesSince(clientId: string, since: Date | null, now: Date): Promise<string[]> {
  const recent = await getDb().clientActivity.findMany({
    where: { clientId, actor: "client", area: { in: WEBSITE_AREAS }, createdAt: { gt: since ?? new Date(now.getTime() - 86_400_000) } },
    orderBy: { createdAt: "asc" },
    select: { summary: true },
  });
  return [...new Set(recent.map((a) => a.summary))].map((s) => `• ${s}`);
}

async function notifyChanges(clientId: string) {
  const info = await clientInfo(clientId);
  if (!info) return;
  const { client } = info;
  const now = new Date();
  const db = getDb();

  // Claim the email slot first, so two quick saves can't both send.
  const claimAdmin = await db.client.updateMany({
    where: { id: clientId, OR: [{ adminEmailedAt: null }, { adminEmailedAt: { lt: new Date(now.getTime() - GROUP_MS) } }] },
    data: { adminEmailedAt: now },
  });
  const paid = accountState(client, now).kind === "paid";
  const claimClient = paid
    ? await db.client.updateMany({
        where: { id: clientId, OR: [{ clientEmailedAt: null }, { clientEmailedAt: { lt: new Date(now.getTime() - GROUP_MS) } }] },
        data: { clientEmailedAt: now },
      })
    : { count: 0 };
  if (claimAdmin.count === 0 && claimClient.count === 0) return;

  if (claimAdmin.count > 0) {
    const changes = await changesSince(clientId, client.adminEmailedAt, now);
    await sendEmail({
      to: await adminEmail(),
      subject: `${client.name} updated their website`,
      lines: [`${client.name} (${planNames[client.plan]}) made changes:`, ...changes],
      action: { label: "Open client in admin", url: `${siteConfig.url}/admin/clients/${client.id}` },
    });
  }
  if (claimClient.count > 0) {
    const changes = await areasSince(clientId, client.clientEmailedAt, now, info.lang);
    const t = clientCopy[info.lang];
    await sendEmail({
      to: info.emails,
      subject: t.changesSubject,
      lines: [t.changesIntro, ...changes],
      action: { label: t.open, url: info.siteUrl },
    });
  }
}

/** Payments are always notified right away. */
export async function recordPaymentActivity(
  clientId: string,
  kind: "cash-requested" | "paid",
  details: { amount: number; plan: string; months: number; method: "PayPal" | "cash"; paidUntil?: Date },
) {
  const db = getDb();
  const period = `${details.months} ${details.months === 1 ? "month" : "months"}`;
  const summary =
    kind === "paid"
      ? `Paid €${details.amount} by ${details.method} for ${details.plan}, ${period}`
      : `Requested a cash payment of €${details.amount} for ${details.plan}, ${period}`;
  await db.clientActivity.create({ data: { clientId, area: "payment", summary } });

  after(async () => {
    try {
      const info = await clientInfo(clientId);
      if (!info) return;
      await sendEmail({
        to: await adminEmail(),
        subject: kind === "paid" ? `Payment received: ${info.client.name}` : `Cash payment to collect: ${info.client.name}`,
        lines: [
          `${info.client.name}: ${summary}.`,
          ...(kind === "cash-requested" ? ["Contact the client to collect it, then click “Mark received” in the admin."] : []),
        ],
        action: { label: "Open client in admin", url: `${siteConfig.url}/admin/clients/${clientId}` },
      });
      if (kind === "paid" && details.paidUntil) {
        const t = clientCopy[info.lang];
        const until = new Intl.DateTimeFormat(info.lang, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(details.paidUntil);
        await sendEmail({ to: info.emails, subject: t.paidSubject, lines: [t.paidLine(details.plan, until)], action: { label: t.open, url: info.siteUrl } });
      }
    } catch (error) {
      console.error("Payment notification failed", error);
    }
  });
}
