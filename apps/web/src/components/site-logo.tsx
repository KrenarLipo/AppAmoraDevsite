import Image from "next/image";
import { getSiteImages } from "@/lib/settings";
import { mediaUrl } from "@/lib/settings/schema";
import { Logo } from "./logo";

/** The uploaded logo if there is one, otherwise the built-in AppAmora logo. */
export async function SiteLogo({ tone = "light", height = 32 }: { tone?: "light" | "dark"; height?: number }) {
  const images = await getSiteImages();
  const image = tone === "dark" ? (images.logoDark ?? images.logo) : images.logo;
  if (!image) return <Logo tone={tone} size={height} />;

  const img = (
    <Image
      src={mediaUrl(image)}
      alt="AppAmora"
      width={Math.round((height * image.width) / image.height)}
      height={height}
      className="w-auto"
      style={{ height }}
      priority={tone === "light"}
    />
  );
  // A logo made for light backgrounds stays readable on dark ones inside a light chip.
  if (tone === "dark" && !images.logoDark) {
    return <span className="inline-flex rounded-lg bg-paper px-2.5 py-1.5">{img}</span>;
  }
  return img;
}
