import type { Metadata } from "next";
import { legalMetadata, LegalPageView } from "@/components/legal-page";

export function generateMetadata(): Promise<Metadata> {
  return legalMetadata("terms");
}

export default function TermsPage() {
  return <LegalPageView doc="terms" />;
}
