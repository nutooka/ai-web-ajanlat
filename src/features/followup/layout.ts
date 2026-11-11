import { siteConfig, siteUrl } from "@/config/site";
import { escapeHtml, type EmailContent } from "@/lib/email/html";

/**
 * Branded layout for the follow-up e-mails, matching the website:
 * paper background, ink header with the gradient "n" mark, white card, coral→pink gradient button with ink text,
 * Bricolage Grotesque headings / Instrument Sans body (web fonts where the client allows, Arial otherwise).
 * Email-safe: tables, inline styles, gradients always with a solid fallback colour.
 */

const C = {
  ink: "#0E0F12",
  paper: "#F5F5F0",
  surface: "#FFFFFF",
  line: "#E4E4DD",
  muted: "#5B5F68",
  brandTint: "#FFF1EC",
  brandSolid: "#FF8A62",
  brandGradient: "linear-gradient(120deg, #FFB547 0%, #FF5E7E 100%)",
  discountSolid: "#FFB547",
  discountGradient: "linear-gradient(135deg, #FFD27A 0%, #FFB547 55%, #FF9447 100%)",
};

const DISPLAY = "'Bricolage Grotesque', 'Helvetica Neue', Arial, sans-serif";
const BODY = "'Instrument Sans', 'Helvetica Neue', Arial, sans-serif";

/** Placeholder replaced with the personal stop link once it exists. */
export const STOP_URL_PLACEHOLDER = "{{STOP_URL}}";

interface QA {
  q: string;
  a: string;
}

interface BrandedEmail {
  subject: string;
  /** Short preview line shown next to the subject in the inbox. */
  preheader: string;
  /** Small label above the heading (e.g. "Ajánlatod · Standard"). */
  eyebrow?: string;
  heading: string;
  greeting: string;
  /** Plain text paragraphs (escaped here); use `links` for inline links. */
  paragraphs: string[];
  /** Highlighted pill (discount, deadline). */
  highlight?: string;
  /** Question–answer cards. */
  qa?: QA[];
  cta?: { label: string; url: string };
  /** Text after the button. */
  after?: string[];
}

function button({ label, url }: { label: string; url: string }): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr>
<td style="border-radius:999px;background-color:${C.brandSolid};background-image:${C.brandGradient};">
<a href="${escapeHtml(url)}" style="display:inline-block;padding:14px 26px;font-family:${BODY};font-size:16px;font-weight:700;color:${C.ink};text-decoration:none;border-radius:999px;">${escapeHtml(label)} &rarr;</a>
</td></tr></table>`;
}

const paragraph = (text: string) => `<p style="margin:0 0 16px;font-family:${BODY};font-size:16px;line-height:1.6;color:${C.ink};">${escapeHtml(text)}</p>`;

function qaCards(items: QA[]): string {
  return items
    .map(
      (item) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;"><tr>
<td style="background:${C.paper};border:1px solid ${C.line};border-radius:14px;padding:16px 18px;">
<p style="margin:0 0 6px;font-family:${DISPLAY};font-size:17px;font-weight:700;color:${C.ink};">${escapeHtml(item.q)}</p>
<p style="margin:0;font-family:${BODY};font-size:15px;line-height:1.55;color:${C.muted};">${escapeHtml(item.a)}</p>
</td></tr></table>`,
    )
    .join("");
}

function highlightPill(text: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;"><tr>
<td style="border-radius:999px;background-color:${C.discountSolid};background-image:${C.discountGradient};padding:8px 16px;font-family:${BODY};font-size:14px;font-weight:700;color:${C.ink};">${escapeHtml(text)}</td>
</tr></table>`;
}

function signature(): string {
  const { person, company, chat } = siteConfig;
  const phone = company.phone;
  const wa = chat.whatsapp ? `https://wa.me/${chat.whatsapp}` : null;
  const contact = [
    phone ? `<a href="tel:${phone.replace(/\s/g, "")}" style="color:${C.ink};text-decoration:none;font-weight:600;">${escapeHtml(phone)}</a>` : null,
    wa ? `<a href="${wa}" style="color:${C.ink};font-weight:600;">WhatsApp</a>` : null,
  ]
    .filter(Boolean)
    .join(` <span style="color:${C.line};">|</span> `);
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 0;border-top:1px solid ${C.line};padding-top:20px;width:100%;"><tr>
<td width="64" valign="top" style="padding-top:20px;"><img src="${siteUrl}${person.photo}" width="52" height="52" alt="${escapeHtml(person.firstName)}" style="display:block;width:52px;height:52px;border-radius:50%;object-fit:cover;"></td>
<td valign="top" style="padding-top:20px;font-family:${BODY};font-size:14px;line-height:1.5;color:${C.muted};">
<span style="font-family:${DISPLAY};font-size:16px;font-weight:700;color:${C.ink};">${escapeHtml(person.firstName)}</span><br>
${escapeHtml(person.role)} · Nutooka<br>${contact}
</td></tr></table>`;
}

export function brandedEmail(email: BrandedEmail): EmailContent {
  const { company } = siteConfig;
  const html = `<!doctype html>
<html lang="hu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light">
<title>${escapeHtml(email.subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Instrument+Sans:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:${C.paper};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.paper};">${escapeHtml(email.preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};"><tr><td align="center" style="padding:24px 12px 32px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">
<tr><td style="background:${C.ink};border-radius:20px 20px 0 0;padding:20px 28px;">
<a href="${siteUrl}" style="text-decoration:none;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="padding-right:10px;"><img src="${siteUrl}/apple-icon" width="32" height="32" alt="" style="display:block;width:32px;height:32px;border-radius:9px;"></td>
<td style="font-family:${DISPLAY};font-size:19px;font-weight:700;letter-spacing:-0.02em;color:#FFFFFF;">nutooka</td>
</tr></table></a>
</td></tr>
<tr><td style="height:4px;line-height:4px;font-size:0;background-color:${C.brandSolid};background-image:${C.brandGradient};">&nbsp;</td></tr>
<tr><td style="background:${C.surface};border-radius:0 0 20px 20px;padding:32px 28px 28px;">
${email.eyebrow ? `<p style="margin:0 0 8px;font-family:${BODY};font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${C.muted};">${escapeHtml(email.eyebrow)}</p>` : ""}
<h1 style="margin:0 0 20px;font-family:${DISPLAY};font-size:28px;line-height:1.15;font-weight:800;letter-spacing:-0.02em;color:${C.ink};">${escapeHtml(email.heading)}</h1>
${email.highlight ? highlightPill(email.highlight) : ""}
${paragraph(email.greeting)}
${email.paragraphs.map(paragraph).join("")}
${email.qa ? qaCards(email.qa) : ""}
${email.cta ? button(email.cta) : ""}
${(email.after ?? []).map(paragraph).join("")}
${signature()}
</td></tr>
<tr><td style="padding:20px 28px 0;font-family:${BODY};font-size:12px;line-height:1.6;color:${C.muted};text-align:center;">
Azért kaptad ezt a levelet, mert ajánlatot vagy átvilágítást kértél a nutooka.tech oldalon.<br>
<a href="${STOP_URL_PLACEHOLDER}" style="color:${C.muted};">Leiratkozás</a> · ${escapeHtml(company.legalName)} · ${escapeHtml(company.postalAddress.addressLocality)}
</td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    email.heading,
    "",
    email.highlight ?? null,
    email.greeting,
    ...email.paragraphs,
    ...(email.qa ?? []).flatMap((item) => [`${item.q}`, item.a]),
    email.cta ? `${email.cta.label}: ${email.cta.url}` : null,
    ...(email.after ?? []),
    "",
    `${siteConfig.person.firstName}\n${siteConfig.person.role} · Nutooka`,
    siteConfig.company.phone ? `Telefon: ${siteConfig.company.phone}` : null,
    siteConfig.chat.whatsapp ? `WhatsApp: https://wa.me/${siteConfig.chat.whatsapp}` : null,
    "",
    `Leiratkozás: ${STOP_URL_PLACEHOLDER}`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n\n");

  return { subject: email.subject, html, text };
}
