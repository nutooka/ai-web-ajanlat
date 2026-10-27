import { siteConfig } from "@/config/site";
import type { Offer } from "@/features/offer/buildOffer";
import type { PackageId } from "@/features/pricing/types";
import { formatHours, formatRon, formatWeeks } from "@/lib/format";
import type { ContactData } from "../schema";

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
  if (pkg.urgencyAdjustment !== 0) itemRows.push([offer.quote.urgency.label, formatRon(pkg.urgencyAdjustment)]);
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
    ["Másolatot kért", contact.wantsCopy ? "Igen" : "Nem"],
  ];
}

export function ownerEmail(offer: Offer, packageId: PackageId, contact: ContactData): EmailContent {
  const quote = quoteSection(offer, packageId, true);
  const answers: [string, string][] = offer.answerRows.map((row) => [row.question, row.answer]);
  const who = contact.company ?? contact.name ?? contact.email ?? "Új érdeklődő";
  const subject = `Új ajánlatkérés: ${offer.projectTypeLabel} – ${who} (${formatRon(offer.quote.packages[packageId].finalPrice)})`;

  const html = layout(
    "Új ajánlatkérés érkezett",
    `${heading("Kapcsolat")}${rows(contactRows(contact))}
${heading("Összefoglaló")}<p style="font-size:14px;line-height:1.6;margin:4px 0 16px;">${escapeHtml(offer.summary)}</p>
${quote.html}${heading("Válaszok")}${rows(answers)}`,
  );

  const text = [
    "ÚJ AJÁNLATKÉRÉS",
    "",
    ...contactRows(contact).map(([key, value]) => `${key}: ${value}`),
    "",
    offer.summary,
    "",
    quote.text,
    "",
    "VÁLASZOK",
    ...answers.map(([key, value]) => `- ${key}: ${value}`),
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
