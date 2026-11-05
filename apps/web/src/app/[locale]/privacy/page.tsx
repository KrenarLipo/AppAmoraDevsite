import type { Metadata } from "next";
import { legalMetadata, LegalPageView } from "@/components/legal-page";

export function generateMetadata(): Promise<Metadata> {
  return legalMetadata("privacy");
}

export default function PrivacyPage() {
  return <LegalPageView doc="privacy" />;
}
