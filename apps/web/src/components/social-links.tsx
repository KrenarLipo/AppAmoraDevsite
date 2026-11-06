import type { ComponentType } from "react";
import { FacebookIcon, InstagramIcon, LinkedInIcon, TikTokIcon, XIcon, YouTubeIcon } from "@/components/icons";
import type { SocialNetwork } from "@/lib/settings/site-info";

const icons: Record<SocialNetwork, ComponentType<{ size?: number }>> = {
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  facebook: FacebookIcon,
  linkedin: LinkedInIcon,
  youtube: YouTubeIcon,
  x: XIcon,
};

export function SocialIcon({ network, size }: { network: SocialNetwork; size?: number }) {
  const Icon = icons[network];
  return <Icon size={size} />;
}
