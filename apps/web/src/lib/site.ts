export const siteConfig = {
  name: "AppAmora",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://appamora.com",
  // TODO: confirm the public contact address and social handles before launch.
  email: "klipo90@gmail.com",
  social: {
    instagram: "https://www.instagram.com/theaideveloper2026",
    tiktok: "https://www.tiktok.com/@aicreator6666?_r=1&_t=ZS-9B5wEgrWyJQ",
  },
  // The website builder (sign-up, dashboard) ships in phase 2. Until then the
  // "Start free trial" buttons lead to the contact form's builder waitlist.
  // Business details shown in the Privacy Policy and Terms (content/legal).
  legal: {
    company: "AppAmora",
    ceo: "Artan Nikolla",
    /** Albanian tax ID (NIPT). */
    taxId: "M11705045O",
    phone: "+355 68 608 5235",
    address: {
      en: "Rruga Ali Visha, Nd. 69, Hyrja 23, Ap. 23, Tirana, Albania",
      it: "Rruga Ali Visha, Nd. 69, Hyrja 23, Ap. 23, Tirana, Albania",
      sq: "Rruga Ali Visha, Nd. 69, Hyrja 23, Ap. 23, Tiranë, Shqipëri",
    },
    country: { en: "Albania", it: "Albania", sq: "Shqipëria" },
  },
  builderLive: false,
  trialDays: 14,
} as const;

/** Where "Start free trial" buttons point while the builder is not live. */
export const trialPath = "/contact?interest=WEBSITE_BUILDER";
