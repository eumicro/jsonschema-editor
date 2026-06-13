import type { JseLocale } from "@jsonschema-editor/vue";

export const operator = {
  name: "Eugen Lange",
  street: "Zum Wäldchen 3",
  postalCode: "26909",
  city: "Neulehe",
  countryDe: "Deutschland",
  countryEn: "Germany",
} as const;

export const projectLinks = {
  repository: "https://github.com/eumicro/jsonschema-editor",
  issues: "https://github.com/eumicro/jsonschema-editor/issues",
  demo: "https://jsonschema-editor.cloudapplication.net/",
} as const;

export type LegalSubsection = {
  title: string;
  paragraphs: string[];
  list?: string[];
};

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  list?: string[];
  subsections?: LegalSubsection[];
};

export type ImprintContent = {
  pageTitle: string;
  lastUpdated: string;
  translationNote?: string;
  sections: LegalSection[];
};

const content = {
  de: {
    pageTitle: "Impressum & Datenschutz",
    lastUpdated: "12. Juni 2026",
    sections: [
      {
        id: "impressum",
        title: "Impressum",
        paragraphs: [
          "Angaben gemäß § 5 Abs. 1 DDG (Digitale-Dienste-Gesetz) und § 18 Abs. 2 MStV (Medienstaatsvertrag):",
        ],
        subsections: [
          {
            title: "Diensteanbieter / Verantwortlich für den Inhalt",
            paragraphs: [
              `${operator.name}`,
              `${operator.street}`,
              `${operator.postalCode} ${operator.city}`,
              operator.countryDe,
            ],
          },
          {
            title: "Kontakt",
            paragraphs: [
              "Postanschrift: siehe oben.",
              `Elektronische Kontaktaufnahme: über das Issue-Formular im GitHub-Projekt (${projectLinks.issues}). Bitte keine sensiblen personenbezogenen Daten in öffentlichen Issues veröffentlichen — nutzen Sie in dem Fall die Postanschrift.`,
              `Quellcode und Projektdokumentation: ${projectLinks.repository}`,
            ],
          },
          {
            title: "EU-Streitbeilegung",
            paragraphs: [
              "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/",
              "Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
            ],
          },
        ],
      },
      {
        id: "datenschutz",
        title: "Datenschutzerklärung",
        paragraphs: [
          "Mit der folgenden Datenschutzerklärung informieren wir Sie über Art, Umfang und Zweck der Verarbeitung personenbezogener Daten bei Nutzung dieser Demo-Anwendung (GitHub Pages).",
        ],
        subsections: [
          {
            title: "1. Verantwortlicher",
            paragraphs: [
              `${operator.name}, ${operator.street}, ${operator.postalCode} ${operator.city}, ${operator.countryDe}`,
              `Kontakt: ${projectLinks.issues} (öffentliche Anfragen) oder Postanschrift wie oben (insbesondere für vertrauliche/datenschutzrechtliche Anliegen).`,
            ],
          },
          {
            title: "2. Überblick der Verarbeitungen",
            paragraphs: [
              "Diese Anwendung ist eine clientseitige Demo zum Testen von JSON-Schema-Formularen. Von Ihnen eingegebene Formulardaten werden standardmäßig nur in Ihrem Browser verarbeitet und in der Oberfläche angezeigt; es erfolgt kein automatischer Versand an unsere Server.",
            ],
            list: [
              "Bereitstellung der Website (Hosting)",
              "Technisch notwendige Verbindungen beim Laden externer Kartenkacheln (OpenStreetMap) in einigen Beispiel-Szenarien",
              "Optionale Kontaktaufnahme durch Sie (z. B. GitHub Issues oder Post)",
            ],
          },
          {
            title: "3. Hosting (GitHub Pages)",
            paragraphs: [
              "Die Website wird über GitHub Pages (Anbieter: GitHub, Inc., USA) bereitgestellt. Beim Aufruf der Seite können Server-Logdaten (z. B. IP-Adresse, Zeitpunkt, angeforderte URL, User-Agent) verarbeitet werden.",
              "Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer stabilen, sicheren Bereitstellung der Demo).",
              "Weitere Informationen: https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement",
            ],
          },
          {
            title: "4. Lokale Verarbeitung im Browser",
            paragraphs: [
              "Formularinhalte, Schema-Anpassungen und JSON-Ausgaben verbleiben in der Regel lokal in Ihrer Browser-Sitzung. Ein dauerhaftes Profil oder Tracking durch uns findet nicht statt.",
              "Die Sprachauswahl wird nur für die aktuelle Sitzung in der Anwendung gehalten (kein Tracking-Cookie durch uns).",
              "Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Funktionsfähigkeit der Demo).",
            ],
          },
          {
            title: "5. OpenStreetMap-Karten (Beispiel-Szenarien)",
            paragraphs: [
              "In einigen Szenarien werden Kartenkacheln von OpenStreetMap-Freien Kartenkacheln (z. B. tile.openstreetmap.org) geladen. Dabei kann Ihre IP-Adresse an den Betreiber der Kachelserver übermittelt werden.",
              "Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Demonstration kartografischer Formularfelder).",
              "Informationen des Anbieters: https://wiki.openstreetmap.org/wiki/Privacy_Policy",
            ],
          },
          {
            title: "6. Speicherdauer",
            paragraphs: [
              "Lokal im Browser eingegebene Demo-Daten werden nicht von uns gespeichert und gehen beim Schließen des Tabs bzw. beim Neuladen der Seite verloren, sofern Sie sie nicht selbst exportieren oder kopieren.",
              "Hosting-Logdaten werden durch GitHub nach deren Vorgaben gespeichert.",
            ],
          },
          {
            title: "7. Ihre Rechte",
            paragraphs: ["Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:"],
            list: [
              "Recht auf Auskunft (Art. 15 DSGVO)",
              "Recht auf Berichtigung (Art. 16 DSGVO)",
              "Recht auf Löschung (Art. 17 DSGVO)",
              "Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)",
              "Recht auf Datenübertragbarkeit (Art. 20 DSGVO)",
              "Recht auf Widerspruch (Art. 21 DSGVO)",
              "Recht auf Widerruf erteilter Einwilligungen (Art. 7 Abs. 3 DSGVO)",
            ],
          },
          {
            title: "8. Beschwerderecht",
            paragraphs: [
              "Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren — insbesondere in dem Mitgliedstaat Ihres gewöhnlichen Aufenthaltsorts, Ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes.",
              "Zuständige Aufsichtsbehörde für Niedersachsen: Die Landesbeauftragte für den Datenschutz Niedersachsen (LfD NDS), Prinzenstraße 5, 30159 Hannover, https://lfd.niedersachsen.de",
            ],
          },
          {
            title: "9. Keine automatisierte Entscheidungsfindung",
            paragraphs: [
              "Es findet keine automatisierte Entscheidungsfindung einschließlich Profiling im Sinne von Art. 22 DSGVO statt.",
            ],
          },
        ],
      },
      {
        id: "haftung",
        title: "Haftung & Urheberrecht",
        paragraphs: [],
        subsections: [
          {
            title: "Haftung für Inhalte",
            paragraphs: [
              "Die Inhalte dieser Demo wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.",
            ],
          },
          {
            title: "Haftung für Links",
            paragraphs: [
              "Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter verantwortlich.",
            ],
          },
          {
            title: "Urheberrecht",
            paragraphs: [
              "Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet. Vervielfältigung, Bearbeitung und Verbreitung bedürfen der schriftlichen Zustimmung, soweit nicht gesetzlich erlaubt.",
            ],
          },
        ],
      },
    ],
  },
  en: {
    pageTitle: "Legal notice & privacy",
    lastUpdated: "12 June 2026",
    translationNote:
      "This English text is provided for convenience. The German version is legally authoritative.",
    sections: [
      {
        id: "impressum",
        title: "Legal notice (Impressum)",
        paragraphs: [
          "Information pursuant to Section 5 (1) DDG (German Digital Services Act) and Section 18 (2) MStV (German Interstate Media Treaty):",
        ],
        subsections: [
          {
            title: "Service provider / person responsible for content",
            paragraphs: [
              `${operator.name}`,
              `${operator.street}`,
              `${operator.postalCode} ${operator.city}`,
              operator.countryEn,
            ],
          },
          {
            title: "Contact",
            paragraphs: [
              "Postal address: see above.",
              `Electronic contact: via the issue form in the GitHub project (${projectLinks.issues}). Please do not post sensitive personal data in public issues — use postal mail instead.`,
              `Source code and documentation: ${projectLinks.repository}`,
            ],
          },
          {
            title: "EU dispute resolution",
            paragraphs: [
              "The European Commission provides an online dispute resolution (ODR) platform: https://ec.europa.eu/consumers/odr/",
              "We are neither obliged nor willing to participate in dispute resolution proceedings before a consumer arbitration board.",
            ],
          },
        ],
      },
      {
        id: "datenschutz",
        title: "Privacy policy",
        paragraphs: [
          "This privacy policy explains how personal data is processed when you use this demo application (GitHub Pages).",
        ],
        subsections: [
          {
            title: "1. Controller",
            paragraphs: [
              `${operator.name}, ${operator.street}, ${operator.postalCode} ${operator.city}, ${operator.countryEn}`,
              `Contact: ${projectLinks.issues} (public enquiries) or postal address as above (especially for confidential/privacy-related requests).`,
            ],
          },
          {
            title: "2. Overview of processing",
            paragraphs: [
              "This application is a client-side demo for JSON Schema forms. Data you enter is processed in your browser and shown in the UI by default; it is not automatically transmitted to our servers.",
            ],
            list: [
              "Provision of the website (hosting)",
              "Technically necessary connections when loading external map tiles (OpenStreetMap) in some example scenarios",
              "Optional contact initiated by you (e.g. GitHub issues or postal mail)",
            ],
          },
          {
            title: "3. Hosting (GitHub Pages)",
            paragraphs: [
              "The site is hosted on GitHub Pages (provider: GitHub, Inc., USA). When you access the site, server log data (e.g. IP address, timestamp, requested URL, user agent) may be processed.",
              "Legal basis: Art. 6 (1) (f) GDPR (legitimate interest in secure, stable demo hosting).",
              "Further information: https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement",
            ],
          },
          {
            title: "4. Local processing in the browser",
            paragraphs: [
              "Form data, schema edits, and JSON output generally remain local to your browser session. We do not maintain a persistent profile or perform tracking.",
              "The language selection is kept only for the current session in the app (no tracking cookie by us).",
              "Legal basis: Art. 6 (1) (f) GDPR (legitimate interest in demo functionality).",
            ],
          },
          {
            title: "5. OpenStreetMap maps (example scenarios)",
            paragraphs: [
              "Some scenarios load map tiles from OpenStreetMap tile servers (e.g. tile.openstreetmap.org). Your IP address may be transmitted to the tile server operator.",
              "Legal basis: Art. 6 (1) (f) GDPR (legitimate interest in demonstrating map form fields).",
              "Provider information: https://wiki.openstreetmap.org/wiki/Privacy_Policy",
            ],
          },
          {
            title: "6. Retention",
            paragraphs: [
              "Demo data entered locally in the browser is not stored by us and is lost when you close the tab or reload the page unless you export or copy it yourself.",
              "Hosting log data is retained by GitHub according to their policies.",
            ],
          },
          {
            title: "7. Your rights",
            paragraphs: ["You have the following rights regarding your personal data:"],
            list: [
              "Right of access (Art. 15 GDPR)",
              "Right to rectification (Art. 16 GDPR)",
              "Right to erasure (Art. 17 GDPR)",
              "Right to restriction of processing (Art. 18 GDPR)",
              "Right to data portability (Art. 20 GDPR)",
              "Right to object (Art. 21 GDPR)",
              "Right to withdraw consent (Art. 7 (3) GDPR)",
            ],
          },
          {
            title: "8. Right to lodge a complaint",
            paragraphs: [
              "You have the right to lodge a complaint with a supervisory authority, in particular in the EU member state of your habitual residence, place of work, or place of the alleged infringement.",
              "Supervisory authority for Lower Saxony, Germany: Die Landesbeauftragte für den Datenschutz Niedersachsen (LfD NDS), Prinzenstraße 5, 30159 Hannover, https://lfd.niedersachsen.de",
            ],
          },
          {
            title: "9. No automated decision-making",
            paragraphs: [
              "We do not use automated decision-making, including profiling, within the meaning of Art. 22 GDPR.",
            ],
          },
        ],
      },
      {
        id: "haftung",
        title: "Liability & copyright",
        paragraphs: [],
        subsections: [
          {
            title: "Liability for content",
            paragraphs: [
              "Demo content was prepared with care. However, we cannot guarantee accuracy, completeness, or timeliness. Obligations to remove or block the use of information under general law remain unaffected.",
            ],
          },
          {
            title: "Liability for links",
            paragraphs: [
              "This offer contains links to external third-party websites. We have no influence over their content; the respective provider is always responsible.",
            ],
          },
          {
            title: "Copyright",
            paragraphs: [
              "Content and works created by the site operator are subject to German copyright law. Third-party contributions are marked as such. Reproduction, editing, and distribution require written consent unless permitted by law.",
            ],
          },
        ],
      },
    ],
  },
} as const satisfies Record<JseLocale, ImprintContent>;

export function imprintFor(locale: JseLocale): ImprintContent {
  return content[locale as keyof typeof content] ?? content.de;
}
