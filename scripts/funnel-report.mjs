#!/usr/bin/env node
// Kérdőív-tölcsér: hányan jutottak el az egyes kérdésekig / lépésekig.
// Futtatás: npm run funnel            (utolsó 30 nap)
//           npm run funnel -- 7       (utolsó 7 nap)
import { readFileSync } from "node:fs";

function loadEnv() {
  const env = { ...process.env };
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && !env[match[1]]) env[match[1]] = match[2].replace(/^"(.*)"$/, "$1");
    }
  } catch {
    // no .env.local: rely on the environment
  }
  return env;
}

const env = loadEnv();
const url = (env.KV_REST_API_URL ?? env.UPSTASH_REDIS_REST_URL)?.replace(/\/$/, "");
const token = env.KV_REST_API_TOKEN ?? env.UPSTASH_REDIS_REST_TOKEN;
if (!url || !token) {
  console.error("Hiányzik a KV_REST_API_URL / KV_REST_API_TOKEN (.env.local – `vercel env pull`).");
  process.exit(1);
}

const days = Number(process.argv[2] ?? 30);
const dayFormat = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Bucharest" });
const keys = Array.from({ length: days }, (_, i) => `funnel:${dayFormat.format(Date.now() - i * 86_400_000)}`);

const response = await fetch(`${url}/pipeline`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify(keys.map((key) => ["HGETALL", key])),
});
const results = await response.json();

const totals = new Map();
for (const { result } of results) {
  for (let i = 0; result && i < result.length; i += 2) totals.set(result[i], (totals.get(result[i]) ?? 0) + Number(result[i + 1]));
}
if (totals.size === 0) {
  console.log(`Még nincs adat az utolsó ${days} napból.`);
  process.exit(0);
}

const LABELS = {
  home_type_pick: "Főoldalon projekttípust választott",
  offer_view: "Ajánlat megnyitva",
  offer_saved: "Ajánlatot elküldte magának",
  chat_click: "Messenger / WhatsApp gomb",
  consultation: "Egyeztetést kért",
};
const questions = [...totals].filter(([step]) => step.startsWith("q:")).sort((a, b) => b[1] - a[1]);
const rows = [
  ...(totals.has("home_type_pick") ? [["home_type_pick", totals.get("home_type_pick")]] : []),
  ...questions,
  ...["offer_view", "offer_saved", "chat_click", "consultation"].filter((s) => totals.has(s)).map((s) => [s, totals.get(s)]),
];

const top = questions[0]?.[1] ?? rows[0][1];
console.log(`Kérdőív-tölcsér – utolsó ${days} nap (látogató/munkamenet)\n`);
let previous = null;
for (const [step, count] of rows) {
  const label = LABELS[step] ?? `Kérdés: ${step.slice(2)}`;
  const drop = previous && step.startsWith("q:") && previous > count ? `  −${previous - count}` : "";
  console.log(`${String(count).padStart(5)}  ${String(Math.round((count / top) * 100)).padStart(3)}%  ${label}${drop}`);
  if (step.startsWith("q:")) previous = count;
}
