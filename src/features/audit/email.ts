import { siteConfig, siteUrl } from "@/config/site";
import { escapeHtml } from "@/features/contact/email/templates";
import { CATEGORY_LABELS, slownessImpact, verdict, type AuditCategory, type AuditResult } from "./audit";
import { GROUP_LABELS } from "./checks";

const ORDER: AuditCategory[] = ["performance", "seo", "accessibility", "bestPractices"];

function scoreRows(result: AuditResult): string {
  return ORDER.map(
    (key) =>
      `<tr><td style="padding:8px 12px;border-bottom:1px solid #ECEAE4;">${escapeHtml(CATEGORY_LABELS[key])}</td><td style="padding:8px 12px;border-bottom:1px solid #ECEAE4;font-weight:bold;">${result.scores[key]}/100 – ${verdict(result.scores[key]).label}</td></tr>`,
  ).join("");
}

function issueList(result: AuditResult): string {
  if (result.issues.length === 0) return "<p>Komoly hibát nem találtunk – szép munka!</p>";
  return `<ol style="padding-left:18px;">${result.issues.map((issue) => `<li style="margin-bottom:8px;"><b>${escapeHtml(issue.title)}</b><br>${escapeHtml(issue.why)}</li>`).join("")}</ol>`;
}

/** Our checklist: only what needs fixing, grouped, with the reason. */
function checklistHtml(result: AuditResult): string {
  const problems = result.inspection?.checks.filter((check) => check.status !== "ok") ?? [];
  if (problems.length === 0) return "";
  const groups = [...new Set(problems.map((check) => check.group))];
  return `<h2 style="font-size:16px;margin:20px 0 6px;">Elérhetőség, jogi minimum, Google</h2>${groups
    .map(
      (group) =>
        `<p style="margin:12px 0 4px;font-weight:bold;">${escapeHtml(GROUP_LABELS[group])}</p><ul style="padding-left:18px;margin:0;">${problems
          .filter((check) => check.group === group)
          .map((check) => `<li style="margin-bottom:6px;"><b>${escapeHtml(check.title)}</b>${check.detail ? `<br>${escapeHtml(check.detail)}` : ""}</li>`)
          .join("")}</ul>`,
    )
    .join("")}`;
}

const checklistText = (result: AuditResult) =>
  (result.inspection?.checks.filter((check) => check.status !== "ok") ?? []).map((check) => `- ${check.title}${check.detail ? ` – ${check.detail}` : ""}`);

const wrap = (title: string, body: string) => `<!doctype html><html lang="hu"><body style="margin:0;background:#F6F5F1;font-family:Arial,Helvetica,sans-serif;color:#14161A;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;">
<tr><td style="background:#14161A;color:#FFFFFF;padding:24px 28px;font-size:20px;font-weight:bold;">${escapeHtml(title)}</td></tr>
<tr><td style="padding:24px 28px;font-size:14px;line-height:1.6;">${body}</td></tr>
<tr><td style="padding:16px 28px;background:#F6F5F1;font-size:12px;color:#5C616B;">${escapeHtml(siteConfig.company.legalName)} · nutooka.tech</td></tr>
</table></td></tr></table></body></html>`;

const textReport = (result: AuditResult) =>
  [
    ...ORDER.map((key) => `- ${CATEGORY_LABELS[key]}: ${result.scores[key]}/100 (${verdict(result.scores[key]).label})`),
    "",
    `Fő tartalom megjelenése (mobil): ${result.metrics.lcp}`,
    "",
    ...result.issues.map((issue, index) => `${index + 1}. ${issue.title} – ${issue.why}`),
  ].join("\n");

export function auditCustomerEmail(result: AuditResult) {
  const plannerUrl = `${siteUrl}/weboldal-felujitas`;
  const html = wrap(
    "A weboldalad átvilágítása",
    `<p>Szia!</p><p>Itt a(z) <b>${escapeHtml(result.url)}</b> átvilágítása (mobilos mérés, Google PageSpeed alapján).</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 20px;">${scoreRows(result)}</table>
<p>${escapeHtml(slownessImpact(result.lcpMs)?.text ?? `A fő tartalom mobilon ${result.metrics.lcp} alatt jelenik meg.`)}</p>
${checklistHtml(result)}
<h2 style="font-size:16px;margin:20px 0 6px;">Sebesség – amit érdemes javítani</h2>${issueList(result)}
<p>Hamarosan személyesen is írok pár sort arról, mit javítanék elsőként. Ha közben kíváncsi vagy, mennyibe kerülne a felújítás: <a href="${plannerUrl}">${plannerUrl}</a></p>`,
  );
  const text = [`A(z) ${result.url} átvilágítása`, "", textReport(result), "", ...checklistText(result), "", `Felújítás: ${plannerUrl}`].join("\n");
  return { subject: `Weboldal-átvilágítás – ${new URL(result.url).hostname}`, html, text };
}

export function auditOwnerEmail(result: AuditResult, email: string) {
  const html = wrap(
    "Új átvilágítás-kérés",
    `<p style="padding:12px 14px;border-radius:10px;background:#FFF1EC;"><b>${escapeHtml(email)}</b> kérte a teljes jelentést. Írj neki pár személyes sort 1–2 napon belül – innen jó eséllyel felújítás lesz.</p>
<p>Oldal: <a href="${escapeHtml(result.url)}">${escapeHtml(result.url)}</a></p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 20px;">${scoreRows(result)}</table>
${result.inspection?.facts.platform ? `<p>Rendszer: <b>${escapeHtml(result.inspection.facts.platform)}</b></p>` : ""}
${checklistHtml(result)}
${issueList(result)}`,
  );
  return { subject: `Átvilágítás-kérés: ${new URL(result.url).hostname} – ${email}`, html, text: [`Átvilágítás-kérés: ${email}`, result.url, "", textReport(result)].join("\n") };
}
