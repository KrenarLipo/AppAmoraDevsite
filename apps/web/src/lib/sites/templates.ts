import type { TemplateId } from "@/lib/catalog";

// The 6 website templates. Each is a theme for the same building blocks (header, hero,
// pages, contact, footer): colors, fonts, corner radius and the hero layout.
// The free trial can use the first three.

export type FontId = "inter" | "dm-sans" | "montserrat" | "poppins" | "playfair" | "lora";

export const fontNames: Record<FontId, string> = {
  inter: "Inter",
  "dm-sans": "DM Sans",
  montserrat: "Montserrat",
  poppins: "Poppins",
  playfair: "Playfair Display",
  lora: "Lora",
};
export const fontIds = Object.keys(fontNames) as FontId[];

export type HeroLayout = "split" | "overlay" | "centered";

export type SiteTheme = {
  id: TemplateId;
  name: string;
  description: string;
  hero: HeroLayout;
  colors: {
    /** Page background. */
    background: string;
    /** Cards, header and footer background. */
    surface: string;
    text: string;
    muted: string;
    /** Buttons and links. */
    primary: string;
    /** Text on primary buttons. */
    onPrimary: string;
  };
  fonts: { heading: FontId; body: FontId };
  /** Corner radius in px. */
  radius: number;
  uppercaseHeadings?: boolean;
};

export const templateOrder: TemplateId[] = ["web-agency", "restaurant", "beauty", "professional", "shop", "fitness"];

export const themes: Record<TemplateId, SiteTheme> = {
  "web-agency": {
    id: "web-agency",
    name: "Web Agency",
    description: "Dark and modern, for studios, freelancers and creatives",
    hero: "split",
    colors: { background: "#0E1116", surface: "#171B22", text: "#F6F5F1", muted: "#A3A9B5", primary: "#FF6A4D", onPrimary: "#0E1116" },
    fonts: { heading: "dm-sans", body: "inter" },
    radius: 14,
  },
  restaurant: {
    id: "restaurant",
    name: "Restaurant & Café",
    description: "Warm and inviting, with a big photo up front",
    hero: "overlay",
    colors: { background: "#F7F0E6", surface: "#FFFAF3", text: "#2B1A14", muted: "#7A6357", primary: "#7A2E1F", onPrimary: "#FFF6EC" },
    fonts: { heading: "playfair", body: "lora" },
    radius: 6,
  },
  beauty: {
    id: "beauty",
    name: "Beauty & Wellness",
    description: "Soft and elegant, for salons, spas and studios",
    hero: "centered",
    colors: { background: "#FBF5F6", surface: "#FFFFFF", text: "#4A2B33", muted: "#8C6F76", primary: "#B5677A", onPrimary: "#FFFFFF" },
    fonts: { heading: "playfair", body: "dm-sans" },
    radius: 24,
  },
  professional: {
    id: "professional",
    name: "Professional Services",
    description: "Clean and trustworthy, for lawyers, accountants and consultants",
    hero: "split",
    colors: { background: "#F4F7FB", surface: "#FFFFFF", text: "#14243A", muted: "#5B6B80", primary: "#1D3557", onPrimary: "#FFFFFF" },
    fonts: { heading: "lora", body: "inter" },
    radius: 8,
  },
  shop: {
    id: "shop",
    name: "Local Shop",
    description: "Bright and friendly, for retail and showrooms",
    hero: "centered",
    colors: { background: "#FFFFFF", surface: "#F3F6F4", text: "#0E1116", muted: "#5E6B66", primary: "#13A36B", onPrimary: "#FFFFFF" },
    fonts: { heading: "poppins", body: "poppins" },
    radius: 16,
  },
  fitness: {
    id: "fitness",
    name: "Fitness & Sport",
    description: "Bold and energetic, for gyms, trainers and clubs",
    hero: "overlay",
    colors: { background: "#16181D", surface: "#1F2228", text: "#F4F5F0", muted: "#A6AAB2", primary: "#D9F24A", onPrimary: "#16181D" },
    fonts: { heading: "montserrat", body: "inter" },
    radius: 4,
    uppercaseHeadings: true,
  },
};

export function getTheme(id: string): SiteTheme {
  return themes[id as TemplateId] ?? themes["web-agency"];
}

/** Starting hero texts for a new site, by template. German and French start from English. */
export const heroDefaults: Record<TemplateId, { en: [string, string]; it: [string, string]; sq: [string, string] }> = {
  "web-agency": {
    en: ["We design websites that bring you clients", "Strategy, design and development for brands that want to grow."],
    it: ["Creiamo siti web che ti portano clienti", "Strategia, design e sviluppo per brand che vogliono crescere."],
    sq: ["Krijojmë faqe interneti që të sjellin klientë", "Strategji, dizajn dhe zhvillim për marka që duan të rriten."],
  },
  restaurant: {
    en: ["Fresh food, made with love", "Seasonal dishes, local ingredients and a table waiting for you."],
    it: ["Cucina fresca, fatta con amore", "Piatti di stagione, ingredienti locali e un tavolo che ti aspetta."],
    sq: ["Ushqim i freskët, i gatuar me dashuri", "Pjata stinore, përbërës vendas dhe një tavolinë që të pret."],
  },
  beauty: {
    en: ["Take time for yourself", "Treatments for face, body and hair in a calm, welcoming space."],
    it: ["Prenditi del tempo per te", "Trattamenti viso, corpo e capelli in uno spazio calmo e accogliente."],
    sq: ["Gjej kohë për veten", "Trajtime për fytyrën, trupin dhe flokët në një ambient të qetë."],
  },
  professional: {
    en: ["Clear advice you can rely on", "Experienced professionals who help your business move forward."],
    it: ["Consulenza chiara su cui contare", "Professionisti esperti che aiutano la tua attività a crescere."],
    sq: ["Këshilla të qarta që mund t'u besosh", "Profesionistë me përvojë që e çojnë biznesin tënd përpara."],
  },
  shop: {
    en: ["Everything you need, close to home", "Quality products and friendly advice from your local shop."],
    it: ["Tutto ciò che ti serve, vicino a casa", "Prodotti di qualità e consigli gentili dal tuo negozio di fiducia."],
    sq: ["Gjithçka që të duhet, pranë shtëpisë", "Produkte cilësore dhe këshilla miqësore nga dyqani yt i lagjes."],
  },
  fitness: {
    en: ["Stronger every day", "Training, classes and coaching to reach your goals."],
    it: ["Più forte ogni giorno", "Allenamenti, corsi e coaching per raggiungere i tuoi obiettivi."],
    sq: ["Më i fortë çdo ditë", "Stërvitje, klasa dhe trajnim për të arritur qëllimet e tua."],
  },
};
