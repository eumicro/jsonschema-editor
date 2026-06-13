import { createComputedCelEnvironment } from "../dist/computed-cel.js";

const env = createComputedCelEnvironment();

const data = { positionen: [{ betrag: 10 }, { betrag: 25.5 }] };
console.log(
  "sum",
  env.evaluate("data.positionen.map(p, double(p.betrag)).sum()", { data }),
);

const app = {
  antragskopf: { antragsdatum: "2026-01-01" },
  auftragsdaten: { adresse: "Berlin" },
  durchfuehrung: { datum: "" },
  abrechnung: { beglichen: false },
};
const expr = `!has(data.antragskopf.antragsdatum) || data.antragsdatum == '' ? 'NEU' :
  (!has(data.auftragsdaten.adresse) || data.auftragsdaten.adresse == '') ? 'ANTRAG_ANGELEGT' :
  (!has(data.durchfuehrung.datum) || data.durchfuehrung.datum == '') ? 'BEREIT_ZUR_DURCHFUEHRUNG' :
  (!data.abrechnung.beglichen) ? 'DURCHGEFUEHRT' : 'ERLEDIGT'`;
console.log("status", env.evaluate(expr.replace("data.antragsdatum", "data.antragskopf.antragsdatum"), { data: app }));
