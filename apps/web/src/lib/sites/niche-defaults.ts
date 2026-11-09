import type { TemplateId } from "@/lib/catalog";

// Starting content for a new site, by template: photos, highlights, the home page
// intro and the closing call to action. German and French start from English.

export type IconId =
  | "sparkle" | "heart" | "clock" | "leaf" | "shield" | "star"
  | "users" | "chart" | "cup" | "dumbbell" | "map" | "check";

export const iconIds: IconId[] = ["sparkle", "heart", "clock", "leaf", "shield", "star", "users", "chart", "cup", "dumbbell", "map", "check"];

type Copy = { en: string; it: string; sq: string };
type Highlight = { icon: IconId; title: Copy; text: Copy };

export type NicheDefaults = {
  /** Two slideshow photos and the intro photo, in /public/templates/<id>/. */
  images: { src: string; width: number; height: number }[];
  highlights: [Highlight, Highlight, Highlight];
  intro: { title: Copy; body: Copy };
  cta: Copy;
};

const img = (id: TemplateId, n: number, height = 640) => ({ src: `/templates/${id}/${n}.webp`, width: 960, height });

export const nicheDefaults: Record<TemplateId, NicheDefaults> = {
  "web-agency": {
    images: [img("web-agency", 1), img("web-agency", 2), img("web-agency", 3)],
    highlights: [
      { icon: "sparkle", title: { en: "Design that stands out", it: "Design che si fa notare", sq: "Dizajn që bie në sy" }, text: { en: "Clean, modern websites that make a great first impression.", it: "Siti moderni e puliti che fanno un'ottima prima impressione.", sq: "Faqe moderne dhe të pastra që lënë përshtypje të mirë." } },
      { icon: "chart", title: { en: "Built to grow", it: "Pensati per crescere", sq: "Të ndërtuara për t'u rritur" }, text: { en: "Fast, found on Google and ready to turn visitors into clients.", it: "Veloci, trovati su Google e pronti a trasformare i visitatori in clienti.", sq: "Të shpejta, të gjetshme në Google dhe gati t'i kthejnë vizitorët në klientë." } },
      { icon: "users", title: { en: "A real partner", it: "Un vero partner", sq: "Një partner i vërtetë" }, text: { en: "We listen first, then design around your goals.", it: "Prima ascoltiamo, poi progettiamo intorno ai tuoi obiettivi.", sq: "Fillimisht dëgjojmë, pastaj projektojmë sipas qëllimeve tuaja." } },
    ],
    intro: {
      title: { en: "Who we are", it: "Chi siamo", sq: "Kush jemi" },
      body: { en: "We're a small, focused team of designers and developers. From the first idea to launch day, we take care of everything, so you can focus on your business.", it: "Siamo un piccolo team di designer e sviluppatori. Dalla prima idea al giorno del lancio ci occupiamo di tutto, così tu puoi pensare alla tua attività.", sq: "Jemi një ekip i vogël dizajnerësh dhe zhvilluesish. Nga ideja e parë deri në ditën e publikimit kujdesemi për gjithçka, që ju të përqendroheni te biznesi juaj." },
    },
    cta: { en: "Have a project in mind? Let's talk.", it: "Hai un progetto in mente? Parliamone.", sq: "Keni një projekt në mendje? Le të flasim." },
  },
  restaurant: {
    images: [img("restaurant", 1), img("restaurant", 2, 612), img("restaurant", 3)],
    highlights: [
      { icon: "leaf", title: { en: "Fresh ingredients", it: "Ingredienti freschi", sq: "Përbërës të freskët" }, text: { en: "Local, seasonal produce in every dish.", it: "Prodotti locali e di stagione in ogni piatto.", sq: "Produkte vendase dhe stinore në çdo pjatë." } },
      { icon: "heart", title: { en: "Made with love", it: "Fatto con amore", sq: "Gatuar me dashuri" }, text: { en: "Recipes from our family, cooked fresh every day.", it: "Ricette di famiglia, preparate fresche ogni giorno.", sq: "Receta familjare, të gatuara të freskëta çdo ditë." } },
      { icon: "clock", title: { en: "Open every day", it: "Aperti tutti i giorni", sq: "Hapur çdo ditë" }, text: { en: "Lunch, dinner and coffee in between. Book your table.", it: "Pranzo, cena e caffè nel mezzo. Prenota il tuo tavolo.", sq: "Drekë, darkë dhe kafe midis tyre. Rezervoni tavolinën tuaj." } },
    ],
    intro: {
      title: { en: "Our kitchen", it: "La nostra cucina", sq: "Kuzhina jonë" },
      body: { en: "A warm place for good food and good company. Come for a quick lunch, stay for dinner with friends: there's always a table waiting for you.", it: "Un posto accogliente per buon cibo e buona compagnia. Vieni per un pranzo veloce, resta per una cena con gli amici: c'è sempre un tavolo che ti aspetta.", sq: "Një vend i ngrohtë për ushqim të mirë dhe shoqëri të mirë. Ejani për një drekë të shpejtë, qëndroni për darkë me miqtë: gjithmonë ka një tavolinë që ju pret." },
    },
    cta: { en: "Book your table today", it: "Prenota il tuo tavolo oggi", sq: "Rezervoni tavolinën sot" },
  },
  beauty: {
    images: [img("beauty", 1), img("beauty", 2, 641), img("beauty", 3)],
    highlights: [
      { icon: "sparkle", title: { en: "Expert care", it: "Cura esperta", sq: "Kujdes profesional" }, text: { en: "Trained specialists for face, body and hair.", it: "Specialisti qualificati per viso, corpo e capelli.", sq: "Specialistë të kualifikuar për fytyrën, trupin dhe flokët." } },
      { icon: "leaf", title: { en: "Natural products", it: "Prodotti naturali", sq: "Produkte natyrale" }, text: { en: "Gentle, high-quality products you can trust.", it: "Prodotti delicati e di qualità di cui fidarsi.", sq: "Produkte të buta e cilësore që mund t'u besoni." } },
      { icon: "heart", title: { en: "Time for you", it: "Tempo per te", sq: "Kohë për veten" }, text: { en: "A calm space to relax and recharge.", it: "Uno spazio tranquillo per rilassarti e ricaricarti.", sq: "Një ambient i qetë për t'u çlodhur dhe rimbushur." } },
    ],
    intro: {
      title: { en: "Welcome", it: "Benvenuta", sq: "Mirë se vini" },
      body: { en: "Step in, slow down and let us take care of you. Every treatment is tailored to you, in a quiet space designed for comfort.", it: "Entra, rallenta e lasciati coccolare. Ogni trattamento è su misura per te, in uno spazio tranquillo pensato per il tuo benessere.", sq: "Hyni, ngadalësoni dhe na lini të kujdesemi për ju. Çdo trajtim përshtatet për ju, në një ambient të qetë të krijuar për rehatinë tuaj." },
    },
    cta: { en: "Book your appointment", it: "Prenota il tuo appuntamento", sq: "Rezervoni takimin tuaj" },
  },
  professional: {
    images: [img("professional", 1), img("professional", 2), img("professional", 3, 636)],
    highlights: [
      { icon: "shield", title: { en: "Trusted advice", it: "Consulenza affidabile", sq: "Këshilla të besueshme" }, text: { en: "Years of experience with businesses like yours.", it: "Anni di esperienza con attività come la tua.", sq: "Vite përvojë me biznese si i juaji." } },
      { icon: "check", title: { en: "Clear and simple", it: "Chiaro e semplice", sq: "Qartë dhe thjesht" }, text: { en: "No jargon: straight answers and transparent prices.", it: "Niente gergo: risposte dirette e prezzi trasparenti.", sq: "Pa zhargon: përgjigje të drejtpërdrejta dhe çmime transparente." } },
      { icon: "clock", title: { en: "Always on time", it: "Sempre puntuali", sq: "Gjithmonë në kohë" }, text: { en: "We meet deadlines, so you never have to worry.", it: "Rispettiamo le scadenze, così non devi preoccuparti.", sq: "I respektojmë afatet, që ju të mos shqetësoheni kurrë." } },
    ],
    intro: {
      title: { en: "About our firm", it: "Il nostro studio", sq: "Rreth studios sonë" },
      body: { en: "We help individuals and companies make confident decisions. Tell us about your situation and we'll find the best way forward together.", it: "Aiutiamo privati e aziende a prendere decisioni sicure. Raccontaci la tua situazione e troveremo insieme la strada migliore.", sq: "Ndihmojmë individë dhe kompani të marrin vendime me siguri. Na tregoni situatën tuaj dhe së bashku do të gjejmë rrugën më të mirë." },
    },
    cta: { en: "Book a free first consultation", it: "Prenota una prima consulenza gratuita", sq: "Rezervoni një konsultë të parë falas" },
  },
  shop: {
    images: [img("shop", 1), img("shop", 2), img("shop", 3, 540)],
    highlights: [
      { icon: "star", title: { en: "Quality you can see", it: "Qualità che si vede", sq: "Cilësi që duket" }, text: { en: "Carefully chosen products from brands we trust.", it: "Prodotti scelti con cura da marchi di fiducia.", sq: "Produkte të zgjedhura me kujdes nga marka që u besojmë." } },
      { icon: "users", title: { en: "Friendly advice", it: "Consigli gentili", sq: "Këshilla miqësore" }, text: { en: "We help you find exactly what you need.", it: "Ti aiutiamo a trovare proprio ciò che ti serve.", sq: "Ju ndihmojmë të gjeni pikërisht atë që ju duhet." } },
      { icon: "map", title: { en: "Close to you", it: "Vicino a te", sq: "Pranë jush" }, text: { en: "Visit our shop or call us to reserve an item.", it: "Vieni in negozio o chiamaci per riservare un articolo.", sq: "Na vizitoni në dyqan ose na telefononi për të rezervuar një artikull." } },
    ],
    intro: {
      title: { en: "Our shop", it: "Il nostro negozio", sq: "Dyqani ynë" },
      body: { en: "A local shop with a personal touch. Come and browse new arrivals every week, and get honest advice from people who know the products.", it: "Un negozio di quartiere con un tocco personale. Vieni a scoprire le novità ogni settimana e ricevi consigli sinceri da chi conosce i prodotti.", sq: "Një dyqan lagjeje me një prekje personale. Ejani të shihni të rejat çdo javë dhe merrni këshilla të sinqerta nga njerëz që i njohin produktet." },
    },
    cta: { en: "Visit us or get in touch", it: "Vieni a trovarci o contattaci", sq: "Na vizitoni ose na kontaktoni" },
  },
  fitness: {
    images: [img("fitness", 1, 637), img("fitness", 2), img("fitness", 3)],
    highlights: [
      { icon: "dumbbell", title: { en: "Modern equipment", it: "Attrezzatura moderna", sq: "Pajisje moderne" }, text: { en: "Everything you need to train your way.", it: "Tutto ciò che ti serve per allenarti a modo tuo.", sq: "Gjithçka që ju duhet për t'u stërvitur sipas mënyrës suaj." } },
      { icon: "users", title: { en: "Expert coaches", it: "Coach esperti", sq: "Trajnerë ekspertë" }, text: { en: "Personal plans and classes for every level.", it: "Piani personali e corsi per ogni livello.", sq: "Plane personale dhe klasa për çdo nivel." } },
      { icon: "heart", title: { en: "Real results", it: "Risultati reali", sq: "Rezultate reale" }, text: { en: "Stay motivated and track your progress.", it: "Resta motivato e segui i tuoi progressi.", sq: "Qëndroni të motivuar dhe ndiqni progresin tuaj." } },
    ],
    intro: {
      title: { en: "Train with us", it: "Allenati con noi", sq: "Stërvituni me ne" },
      body: { en: "Whether you're just starting or training for a goal, our team helps you get there. Join a class, book a personal session or come and try your first workout free.", it: "Che tu stia iniziando o abbia un obiettivo preciso, il nostro team ti aiuta a raggiungerlo. Partecipa a un corso, prenota una sessione personale o prova il primo allenamento gratis.", sq: "Qoftë se sapo po filloni apo stërviteni për një qëllim, ekipi ynë ju ndihmon ta arrini. Bashkohuni në një klasë, rezervoni një seancë personale ose provoni stërvitjen e parë falas." },
    },
    cta: { en: "Start today: your first workout is free", it: "Inizia oggi: il primo allenamento è gratis", sq: "Filloni sot: stërvitja e parë është falas" },
  },
};
