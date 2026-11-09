import { DM_Sans, Lora, Montserrat, Playfair_Display, Poppins } from "next/font/google";
import { fontVariables } from "@/lib/fonts";

// Fonts clients can choose for their sites. Browsers only download the ones a page uses.
const dmSans = DM_Sans({ variable: "--font-site-dm-sans", subsets: ["latin", "latin-ext"] });
const montserrat = Montserrat({ variable: "--font-site-montserrat", subsets: ["latin", "latin-ext"] });
const poppins = Poppins({ variable: "--font-site-poppins", subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"] });
const playfair = Playfair_Display({ variable: "--font-site-playfair", subsets: ["latin", "latin-ext"] });
const lora = Lora({ variable: "--font-site-lora", subsets: ["latin", "latin-ext"] });

/** All font variables, for the <html> element of site pages and the dashboard (font previews). */
export const siteFontVariables = [fontVariables, dmSans.variable, montserrat.variable, poppins.variable, playfair.variable, lora.variable].join(" ");

export { fontFamilies } from "./fonts-client";
