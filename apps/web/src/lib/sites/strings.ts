import type { SiteLanguage } from "./languages";

// The few fixed texts on clients' sites (form labels, notices), in every site language.
type Strings = {
  menu: string;
  close: string;
  name: string;
  email: string;
  message: string;
  send: string;
  sending: string;
  sent: string;
  error: string;
  invalid: string;
  subscribe: string;
  subscribed: string;
  emailPlaceholder: string;
  phone: string;
  address: string;
  hours: string;
  whatsapp: string;
  madeWith: string;
  offlineTitle: string;
  offlineBody: string;
  notFound: string;
  backHome: string;
};

export const siteStrings: Record<SiteLanguage, Strings> = {
  en: {
    menu: "Menu", close: "Close", name: "Name", email: "Email", message: "Message", send: "Send message", sending: "Sending…",
    sent: "Thank you! Your message has been sent.", error: "Something went wrong. Please try again.",
    invalid: "Please fill in your name, a valid email and a message.", subscribe: "Subscribe",
    subscribed: "Thank you for subscribing!", emailPlaceholder: "Your email", phone: "Phone", address: "Address",
    hours: "Opening hours", whatsapp: "Chat on WhatsApp", madeWith: "Made with AppAmora",
    offlineTitle: "This website is temporarily unavailable", offlineBody: "Please check back soon.",
    notFound: "Page not found", backHome: "Back to the home page",
  },
  it: {
    menu: "Menu", close: "Chiudi", name: "Nome", email: "Email", message: "Messaggio", send: "Invia messaggio", sending: "Invio…",
    sent: "Grazie! Il tuo messaggio è stato inviato.", error: "Qualcosa è andato storto. Riprova.",
    invalid: "Inserisci nome, un'email valida e un messaggio.", subscribe: "Iscriviti",
    subscribed: "Grazie per l'iscrizione!", emailPlaceholder: "La tua email", phone: "Telefono", address: "Indirizzo",
    hours: "Orari di apertura", whatsapp: "Scrivici su WhatsApp", madeWith: "Creato con AppAmora",
    offlineTitle: "Questo sito è temporaneamente non disponibile", offlineBody: "Torna a trovarci presto.",
    notFound: "Pagina non trovata", backHome: "Torna alla home",
  },
  sq: {
    menu: "Menu", close: "Mbyll", name: "Emri", email: "Email", message: "Mesazhi", send: "Dërgo mesazhin", sending: "Duke dërguar…",
    sent: "Faleminderit! Mesazhi juaj u dërgua.", error: "Diçka shkoi keq. Provoni përsëri.",
    invalid: "Plotësoni emrin, një email të vlefshëm dhe mesazhin.", subscribe: "Abonohu",
    subscribed: "Faleminderit që u abonuat!", emailPlaceholder: "Email-i juaj", phone: "Telefoni", address: "Adresa",
    hours: "Orari", whatsapp: "Na shkruani në WhatsApp", madeWith: "Krijuar me AppAmora",
    offlineTitle: "Kjo faqe nuk është e disponueshme përkohësisht", offlineBody: "Ju lutemi kthehuni së shpejti.",
    notFound: "Faqja nuk u gjet", backHome: "Kthehu në kryefaqe",
  },
  de: {
    menu: "Menü", close: "Schließen", name: "Name", email: "E-Mail", message: "Nachricht", send: "Nachricht senden", sending: "Wird gesendet…",
    sent: "Danke! Ihre Nachricht wurde gesendet.", error: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
    invalid: "Bitte geben Sie Ihren Namen, eine gültige E-Mail und eine Nachricht ein.", subscribe: "Abonnieren",
    subscribed: "Danke für Ihr Abonnement!", emailPlaceholder: "Ihre E-Mail", phone: "Telefon", address: "Adresse",
    hours: "Öffnungszeiten", whatsapp: "Auf WhatsApp schreiben", madeWith: "Erstellt mit AppAmora",
    offlineTitle: "Diese Website ist vorübergehend nicht verfügbar", offlineBody: "Bitte schauen Sie bald wieder vorbei.",
    notFound: "Seite nicht gefunden", backHome: "Zur Startseite",
  },
  fr: {
    menu: "Menu", close: "Fermer", name: "Nom", email: "E-mail", message: "Message", send: "Envoyer", sending: "Envoi…",
    sent: "Merci ! Votre message a été envoyé.", error: "Une erreur est survenue. Veuillez réessayer.",
    invalid: "Indiquez votre nom, un e-mail valide et un message.", subscribe: "S'abonner",
    subscribed: "Merci pour votre inscription !", emailPlaceholder: "Votre e-mail", phone: "Téléphone", address: "Adresse",
    hours: "Horaires d'ouverture", whatsapp: "Écrire sur WhatsApp", madeWith: "Créé avec AppAmora",
    offlineTitle: "Ce site est temporairement indisponible", offlineBody: "Revenez bientôt.",
    notFound: "Page introuvable", backHome: "Retour à l'accueil",
  },
};
