export const siteConfig = {
  name: "AppAmora",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://appamora.com",
  // Contact details, social links, prices and company details are edited at
  // /admin/settings (getSiteInfo in src/lib/settings).
  // The website builder (sign-up, dashboard) ships in phase 2. Until then the
  // "Start free trial" buttons lead to the contact form's builder waitlist.
  builderLive: false,
} as const;

/** Where "Start free trial" buttons point while the builder is not live. */
export const trialPath = "/contact?interest=WEBSITE_BUILDER";
