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
  builderLive: false,
  trialDays: 14,
} as const;

/** Where "Start free trial" buttons point while the builder is not live. */
export const trialPath = "/contact?interest=WEBSITE_BUILDER";
