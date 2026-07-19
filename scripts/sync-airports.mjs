import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const SOURCE = "https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/airports.csv";
const OUTPUT = resolve("src/data/airports/airports.json");

function parseCsvLine(line) {
  const fields = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && quoted && line[index + 1] === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      fields.push(field);
      field = "";
    } else {
      field += character;
    }
  }
  fields.push(field);
  return fields;
}

const response = await fetch(SOURCE);
if (!response.ok) throw new Error(`OurAirports download failed: ${response.status}`);
const lines = (await response.text()).split(/\r?\n/).filter(Boolean);
const headers = parseCsvLine(lines[0]);
const column = Object.fromEntries(headers.map((name, index) => [name, index]));
const allowedTypes = new Set(["large_airport", "medium_airport", "small_airport"]);

const airports = lines.slice(1).map(parseCsvLine).filter((row) => {
  const iata = row[column.iata_code];
  return /^[A-Z]{3}$/.test(iata) && allowedTypes.has(row[column.type]) && row[column.scheduled_service] === "yes";
}).map((row) => ({
  code: row[column.iata_code],
  name: row[column.name],
  city: row[column.municipality] || row[column.name],
  country: row[column.iso_country],
  type: row[column.type],
  keywords: row[column.keywords] || "",
})).sort((left, right) => {
  const weight = { large_airport: 0, medium_airport: 1, small_airport: 2 };
  return weight[left.type] - weight[right.type] || left.city.localeCompare(right.city) || left.name.localeCompare(right.name);
});

await mkdir(dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, `${JSON.stringify(airports)}\n`);
console.log(`Wrote ${airports.length} scheduled-service airports to ${OUTPUT}`);
