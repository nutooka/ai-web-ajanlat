import { siteConfig } from "@/config/site";
import type { Offer } from "@/features/offer/buildOffer";
import type { PackageId } from "@/features/pricing/types";
import { formatHours, formatRon, formatWeeks } from "@/lib/format";
import { CALLBACK_LABELS, type ContactData } from "../schema";

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const cell = "padding:8px 12px;border-bottom:1px solid #ECEAE4;vertical-align:top;font-size:14px;";

function layout(title: string, body: string): string {
  return `<!doctype html><html lang="hu"><body style="margin:0;background:#F6F5F1;font-family:Arial,Helvetica,sans-serif;color:#14161A;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;">
<tr><td style="background:#14161A;color:#FFFFFF;padding:24px 28px;font-size:20px;font-weight:bold;">${escapeHtml(title)}</td></tr>
<tr><td style="padding:24px 28px;">${body}</td></tr>
<tr><td style="padding:16px 28px;background:#F6F5F1;font-size:12px;color:#5C616B;">${escapeHtml(siteConfig.company.legalName)} · ${escapeHtml(siteConfig.name)}</td></tr>
</table></td></tr></table></body></html>`;
}

function rows(entries: [string, string][]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 20px;">${entries
    .map(([key, value]) => `<tr><td style="${cell}color:#5C616B;width:40%;">${escapeHtml(key)}</td><td style="${cell}">${escapeHtml(value)}</td></tr>`)
    .join("")}</table>`;
}

const heading = (text: string) => `<h2 style="font-size:16px;margin:20px 0 4px;">${escapeHtml(text)}</h2>`;

/** `internal` adds effective hours – only for the owner's e-mail, never the customer's. */
function quoteSection(offer: Offer, packageId: PackageId, internal: boolean): { html: string; text: string } {
  const pkg = offer.quote.packages[packageId];
  const itemRows: [string, string][] = pkg.items.map((item) => [
    internal ? `${item.label} (${formatHours(item.hours)})` : item.label,
    formatRon(item.price),
  ]);
  itemRows.push([pkg.schedule.label, pkg.urgencyAdjustment === 0 ? "0 RON" : formatRon(pkg.urgencyAdjustment)]);
  itemRows.push(["Listaár", formatRon(pkg.listPrice)]);
  for (const discount of pkg.discounts) itemRows.push([`${discount.label} (−${discount.percent}%)`, `−${formatRon(discount.amount)}`]);
  itemRows.push(["Becsült projektár (nettó)", formatRon(pkg.finalPrice)]);

  const meta: [string, string][] = [
    ["Csomag", pkg.name],
    ...(internal ? ([["Számlázott munkaórák (belső)", formatHours(pkg.hours)]] as [string, string][]) : []),
    ...(offer.quote.quickDecision.percent > 0
      ? ([[`${offer.quote.packages[packageId].discounts.find((d) => d.id === "quick")?.label ?? "Gyors döntés kedvezmény"} (rögzítve)`, `−${offer.quote.quickDecision.percent}%`]] as [string, string][])
      : []),
    ["Becsült átfutás", formatWeeks(pkg.timeline.minWeeks, pkg.timeline.maxWeeks)],
    ["Fenntartás (havonta)", formatRon(pkg.maintenance.monthlyTotal)],
    ["Fenntartás (évente, domainnel)", formatRon(pkg.maintenance.yearlyTotal)],
  ];

  const html = `${heading(`${pkg.name} csomag`)}${rows(meta)}${heading("Tételes kalkuláció")}${rows(itemRows)}`;
  const text = [...meta, ...itemRows].map(([key, value]) => `${key}: ${value}`).join("\n");
  return { html, text };
}

function contactRows(contact: ContactData): [string, string][] {
  return [
    ["Név", contact.name ?? "–"],
    ["E-mail", contact.email ?? "–"],
    ["Telefon", contact.phone ?? "–"],
    ["Cég", contact.company ?? "–"],
    ["Megjegyzés", contact.message ?? "–"],
    ["Mikor keressük", contact.callbackTime ? CALLBACK_LABELS[contact.callbackTime] : "–"],
    ["Másolatot kért", contact.wantsCopy ? "Igen" : "Nem"],
  ];
}

/** Server-side facts about the request that the visitor cannot change. */
export interface SubmissionMeta {
  submittedAt: number;
  /** First time this browser opened an offer (signed cookie); null if no valid cookie arrived. */
  offerOpenedAt: number | null;
  offerAgeMinutes: number;
  /** Repeat-request check against the per-contact store. */
  lock?: { status: "off" | "error" } | { status: "first" | "repeat"; firstSeenAt: number };
  /** Link to the stored offer (all answers), if the share store is configured. */
  shareUrl?: string | null;
}

const dateTime = new Intl.DateTimeFormat("hu-HU", { timeZone: "Europe/Bucharest", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

function formatDuration(minutes: number): string {
  const total = Math.round(minutes);
  if (total < 1) return "kevesebb mint 1 perc";
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (hours === 0) return `${rest} perc`;
  if (hours < 48) return rest ? `${hours} óra ${rest} perc` : `${hours} óra`;
  return `${Math.floor(hours / 24)} nap`;
}

function bulletList(items: string[]): string {
  return `<ul style="margin:6px 0 18px;padding-left:20px;font-size:14px;line-height:1.7;">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

/** The "what do I do now" box at the very top of the owner's e-mail. */
function actionBox(contact: ContactData, offer: Offer, packageId: PackageId): string {
  const pkg = offer.quote.packages[packageId];
  const reach = [contact.phone, contact.email].filter(Boolean).join(" · ");
  const when = contact.callbackTime ? CALLBACK_LABELS[contact.callbackTime] : "nincs megadva";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3FBD6;border:2px solid #0E0F12;border-radius:12px;margin:0 0 20px;">
<tr><td style="padding:16px 18px;font-size:15px;line-height:1.7;">
<b>Teendő: keresd ${escapeHtml(contact.name ?? "az érdeklődőt")}${contact.company ? ` (${escapeHtml(contact.company)})` : ""}</b><br>
Elérhetőség: <b>${escapeHtml(reach || "–")}</b><br>
Mikor kérte: <b>${escapeHtml(when)}</b><br>
Csomag: <b>${escapeHtml(pkg.name)}</b> · <b>${escapeHtml(formatRon(pkg.finalPrice))}</b> · ${escapeHtml(formatWeeks(pkg.timeline.minWeeks, pkg.timeline.maxWeeks))}
</td></tr></table>`;
}

function lockLabel(meta: SubmissionMeta): string {
  const lock = meta.lock ?? { status: "off" };
  switch (lock.status) {
    case "repeat":
      return `IGEN – erről az elérhetőségről már kért ajánlatot (első: ${dateTime.format(lock.firstSeenAt)}); a kedvezményt az első időponttól számoltuk`;
    case "first":
      return "Nem, ez az első kérés erről az elérhetőségről";
    case "error":
      return "Nem sikerült ellenőrizni (a tároló nem válaszolt) – csak a süti alapján számoltunk";
    default:
      return "Nincs ellenőrizve (a tároló nincs beállítva)";
  }
}

function timingRows(offer: Offer, meta: SubmissionMeta): [string, string][] {
  const quick = offer.quote.quickDecision;
  return [
    ["Kérés beküldve", dateTime.format(meta.submittedAt)],
    ["Ajánlat első megnyitása", meta.offerOpenedAt === null ? "ismeretlen (nem érkezett érvényes süti)" : dateTime.format(meta.offerOpenedAt)],
    ["Ennyi idő után kért egyeztetést", meta.offerOpenedAt === null ? "–" : formatDuration(meta.offerAgeMinutes)],
    ["Gyors döntés kedvezmény", quick.percent > 0 ? `−${quick.percent}% (rögzítve)` : "nem járt (lejárt az idő)"],
    ["Ismételt kérés?", lockLabel(meta)],
    ...(meta.shareUrl ? ([["Teljes ajánlat online", meta.shareUrl]] as [string, string][]) : []),
  ];
}

function scheduleRows(offer: Offer, packageId: PackageId): [string, string][] {
  const { schedule } = offer.quote.packages[packageId];
  const change = Math.round((schedule.multiplier - 1) * 100);
  return [
    ["Választott határidő", schedule.chosenWeeks ? `${schedule.chosenWeeks} hét (csúszkán)` : `${offer.quote.urgency.label} (kérdőív)`],
    ["Normál ütemezés", `${schedule.normalWeeks} hét`],
    ["Lehetséges tartomány", `${schedule.fastestWeeks}–${schedule.latestWeeks} hét`],
    ["Határidő hatása az árra", change === 0 ? "nincs" : change > 0 ? `+${change}% felár` : `${change}% kedvezmény`],
  ];
}

function packagesRows(offer: Offer, packageId: PackageId): [string, string][] {
  return (["basic", "standard", "premium"] as const).map((id) => {
    const pkg = offer.quote.packages[id];
    const marks = [id === packageId ? "VÁLASZTOTT" : "", id === offer.quote.recommended ? "ajánlott" : ""].filter(Boolean).join(", ");
    return [`${pkg.name}${marks ? ` (${marks})` : ""}`, `${formatRon(pkg.finalPrice)} (lista: ${formatRon(pkg.listPrice)}) · ${formatWeeks(pkg.timeline.minWeeks, pkg.timeline.maxWeeks)}`];
  });
}

function maintenanceRows(offer: Offer, packageId: PackageId): [string, string][] {
  const m = offer.quote.packages[packageId].maintenance;
  return [
    ["Tárhely, üzemeltetés", `${formatRon(m.hostingMonthly)}/hó`],
    [m.supportLabel, `${formatRon(m.supportMonthly)}/hó`],
    ["Domain", `${formatRon(m.domainYearly)}/év`],
    ["Összesen", `${formatRon(m.monthlyTotal)}/hó · ${formatRon(m.yearlyTotal)}/év`],
  ];
}

export function ownerEmail(offer: Offer, packageId: PackageId, contact: ContactData, meta: SubmissionMeta): EmailContent {
  const pkg = offer.quote.packages[packageId];
  const quote = quoteSection(offer, packageId, true);
  const answers: [string, string][] = offer.answerRows.map((row) => [row.question, row.answer]);
  const who = contact.company ?? contact.name ?? contact.phone ?? contact.email ?? "Új érdeklődő";
  const when = contact.callbackTime ? ` · hívás: ${CALLBACK_LABELS[contact.callbackTime].toLowerCase()}` : "";
  const subject = `Új ajánlatkérés: ${offer.projectTypeLabel} – ${who} (${formatRon(pkg.finalPrice)})${when}`;
  const budget = offer.quote.budget
    ? offer.quote.budget.withinBasic
      ? `belefér, ajánlott: ${offer.quote.packages[offer.quote.recommended].name}`
      : "a Basic csomag is meghaladja"
    : "nem adott meg keretet";

  const sections: { title: string; rows?: [string, string][]; list?: string[]; text?: string }[] = [
    { title: "Időzítés", rows: timingRows(offer, meta) },
    { title: "Kapcsolat", rows: contactRows(contact) },
    { title: "Összefoglaló", text: offer.summary },
    { title: "Határidő", rows: scheduleRows(offer, packageId) },
    { title: "Mindhárom csomag", rows: [...packagesRows(offer, packageId), ["Keret", budget]] },
    { title: "Választott funkciók", list: offer.selectedFeatures.length ? offer.selectedFeatures : ["–"] },
    { title: `Mit tartalmaz (${pkg.name})`, list: offer.includes[packageId] },
    { title: `Mit nem tartalmaz (${pkg.name})`, list: offer.excludes[packageId] },
    { title: "Javasolt technológia", rows: [["Megoldás", offer.tech.title], ["Leírás", offer.tech.description], ["Stack", offer.tech.stack.join(", ")]] },
    { title: "Fenntartás", rows: maintenanceRows(offer, packageId) },
    { title: "Minden válasz a kérdőívből", rows: answers },
  ];

  const sectionHtml = sections
    .map((section) =>
      section.rows
        ? `${heading(section.title)}${rows(section.rows)}`
        : section.list
          ? `${heading(section.title)}${bulletList(section.list)}`
          : `${heading(section.title)}<p style="font-size:14px;line-height:1.6;margin:4px 0 16px;">${escapeHtml(section.text ?? "")}</p>`,
    )
    .join("\n");

  const html = layout("Új ajánlatkérés érkezett", `${actionBox(contact, offer, packageId)}${quote.html}${sectionHtml}`);

  const sectionText = sections.flatMap((section) => [
    "",
    section.title.toUpperCase(),
    ...(section.rows ? section.rows.map(([key, value]) => `- ${key}: ${value}`) : section.list ? section.list.map((item) => `- ${item}`) : [section.text ?? ""]),
  ]);
  const text = [
    "ÚJ AJÁNLATKÉRÉS",
    `Teendő: keresd ${contact.name ?? "az érdeklődőt"} – ${[contact.phone, contact.email].filter(Boolean).join(" · ")}`,
    `Mikor kérte: ${contact.callbackTime ? CALLBACK_LABELS[contact.callbackTime] : "nincs megadva"}`,
    "",
    quote.text,
    ...sectionText,
  ].join("\n");

  return { subject, html, text };
}

export function customerEmail(offer: Offer, packageId: PackageId, contact: ContactData): EmailContent {
  const quote = quoteSection(offer, packageId, false);
  const greeting = contact.name ? `Kedves ${contact.name}!` : "Kedves Érdeklődő!";
  const subject = `Becsült árajánlatod – ${offer.projectTypeLabel}`;
  const steps = offer.nextSteps.map((step, index) => `${index + 1}. ${step}`);

  const html = layout(
    "Köszönjük az érdeklődést!",
    `<p style="font-size:15px;">${escapeHtml(greeting)}</p>
<p style="font-size:14px;line-height:1.6;">Megkaptuk az ajánlatkérésed, hamarosan jelentkezünk. Az alábbiakban a becsült ajánlat másolatát találod.</p>
${heading("Összefoglaló")}<p style="font-size:14px;line-height:1.6;">${escapeHtml(offer.summary)}</p>
${quote.html}${heading("Következő lépések")}<p style="font-size:14px;line-height:1.8;">${steps.map(escapeHtml).join("<br>")}</p>
<p style="font-size:12px;color:#5C616B;border-top:1px solid #ECEAE4;padding-top:12px;">${escapeHtml(offer.disclaimer)}</p>`,
  );

  const text = [greeting, "", "Megkaptuk az ajánlatkérésed, hamarosan jelentkezünk.", "", offer.summary, "", quote.text, "", ...steps, "", offer.disclaimer].join("\n");
  return { subject, html, text };
}
