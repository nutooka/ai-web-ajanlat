import { siteConfig } from "@/config/site";

/** Email-safe HTML building blocks shared by every transactional e-mail (tables, inline styles). */

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

/** Base wrapper: dark title bar, white card, company footer. `body` is trusted HTML (escape its parts). */
export function emailLayout(title: string, body: string): string {
  return `<!doctype html><html lang="hu"><body style="margin:0;background:#F6F5F1;font-family:Arial,Helvetica,sans-serif;color:#14161A;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;">
<tr><td style="background:#14161A;color:#FFFFFF;padding:24px 28px;font-size:20px;font-weight:bold;">${escapeHtml(title)}</td></tr>
<tr><td style="padding:24px 28px;font-size:14px;line-height:1.6;">${body}</td></tr>
<tr><td style="padding:16px 28px;background:#F6F5F1;font-size:12px;color:#5C616B;">${escapeHtml(siteConfig.company.legalName)} · ${escapeHtml(siteConfig.name)}</td></tr>
</table></td></tr></table></body></html>`;
}

/** Key–value table; both sides are escaped. */
export function rows(entries: [string, string][]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 20px;">${entries
    .map(([key, value]) => `<tr><td style="${cell}color:#5C616B;width:40%;">${escapeHtml(key)}</td><td style="${cell}">${escapeHtml(value)}</td></tr>`)
    .join("")}</table>`;
}

export const heading = (text: string) => `<h2 style="font-size:16px;margin:20px 0 4px;">${escapeHtml(text)}</h2>`;

export function bulletList(items: string[]): string {
  return `<ul style="margin:6px 0 18px;padding-left:20px;font-size:14px;line-height:1.7;">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}
