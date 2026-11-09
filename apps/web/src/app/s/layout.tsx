import type { Metadata } from "next";
import { siteFontVariables } from "@/lib/sites/fonts";
import "../globals.css";

export const metadata: Metadata = {
  // Until clients' sites move to their own subdomains, keep them out of search results.
  robots: { index: false, follow: true },
};

// Clients' websites (appamora.com/s/<name>) have their own root layout: no AppAmora header or footer.
// Each page sets its language on <main>, since one site can have several.
export default function ClientSitesRootLayout({ children }: LayoutProps<"/s">) {
  return (
    <html lang="en" className={siteFontVariables}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
