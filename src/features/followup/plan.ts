import { siteConfig, siteUrl } from "@/config/site";
import { escapeHtml, type EmailContent } from "@/features/contact/email/templates";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Never schedule closer than this to "now" – the visitor just got a confirmation e-mail. */
const MIN_GAP = 2 * HOUR;
/** Resend schedules at most 30 days ahead; keep a safety margin. */
export const MAX_AHEAD = 29 * DAY;

export interface FollowUp {
  /** Stable id, e.g. "offer.reminder" – shown to the owner and used in tests. */
  id: string;
  sendAt: number;
  email: EmailContent;
}

export interface OfferFollowUpInput {
  now: number;
  /** When the quick-decision discount ends, or null when there is none (any more). */
  discountEndsAt: number | null;
  discountPercent: number;
  packageName: string;
  shareUrl: string | null;
  firstName?: string;
}

export interface AuditFollowUpInput {
  now: number;
  url: string;
}

const dateTime = new Intl.DateTimeFormat("hu-HU", { timeZone: "Europe/Bucharest", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

const greeting = (firstName?: string) => (firstName ? `Szia ${firstName}!` : "Szia!");

const whatsAppUrl = () => (siteConfig.chat.whatsapp ? `https://wa.me/${siteConfig.chat.whatsapp}` : null);

function contactLinesHtml(): string {
  const phone = siteConfig.company.phone;
  const wa = whatsAppUrl();
  return [
    phone ? `Telefon: <a href="tel:${phone.replace(/\s/g, "")}" style="color:#14161A;">${escapeHtml(phone)}</a>` : null,
    wa ? `WhatsApp: <a href="${wa}" style="color:#14161A;">írj itt</a>` : null,
  ]
    .filter(Boolean)
    .join("<br>");
}

const contactLinesText = () => [siteConfig.company.phone ? `Telefon: ${siteConfig.company.phone}` : null, whatsAppUrl() ? `WhatsApp: ${whatsAppUrl()}` : null].filter(Boolean).join("\n");

/** Plain, personal layout: these read like a note from Betti, not a newsletter. */
function letter(paragraphs: string[], textParagraphs: string[], subject: string): EmailContent {
  const name = siteConfig.person.firstName;
  const html = `<!doctype html><html lang="hu"><body style="margin:0;background:#FFFFFF;font-family:Arial,Helvetica,sans-serif;color:#14161A;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:24px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;font-size:15px;line-height:1.6;">
<tr><td>${paragraphs.map((paragraph) => `<p style="margin:0 0 14px;">${paragraph}</p>`).join("")}
<p style="margin:0 0 14px;">${escapeHtml(name)}<br><span style="color:#5C616B;">${escapeHtml(siteConfig.person.role)}, Nutooka</span><br>${contactLinesHtml()}</p>
<p style="margin:24px 0 0;font-size:12px;color:#5C616B;">Nem kérsz több ilyen levelet? <a href="{{STOP_URL}}" style="color:#5C616B;">Leiratkozás</a> · ${escapeHtml(siteConfig.company.legalName)}</p>
</td></tr></table></td></tr></table></body></html>`;
  const text = [...textParagraphs, "", `${name}, ${siteConfig.person.role}, Nutooka`, contactLinesText(), "", "Leiratkozás: {{STOP_URL}}"].join("\n\n");
  return { subject, html, text };
}

/** Placeholder replaced with the personal stop link once it exists. */
export const STOP_URL_PLACEHOLDER = "{{STOP_URL}}";

export function withStopUrl(email: EmailContent, stopUrl: string): EmailContent {
  return {
    subject: email.subject,
    html: email.html.replaceAll(STOP_URL_PLACEHOLDER, escapeHtml(stopUrl)),
    text: email.text.replaceAll(STOP_URL_PLACEHOLDER, stopUrl),
  };
}

const keep = (followUps: FollowUp[], now: number) => followUps.filter((item) => item.sendAt >= now + MIN_GAP && item.sendAt <= now + MAX_AHEAD);

/**
 * After an offer request with an e-mail address:
 * 1. 12 hours before the quick-decision discount ends (only for saved offers: a consultation request already locks the discount),
 * 2. day 3: the usual worries, answered,
 * 3. day 7: a short personal check-in.
 */
export function offerFollowUps(input: OfferFollowUpInput): FollowUp[] {
  const { now, discountEndsAt, discountPercent, packageName, shareUrl, firstName } = input;
  const linkHtml = shareUrl ? `<a href="${escapeHtml(shareUrl)}" style="color:#14161A;font-weight:bold;">Az ajánlatod megnyitása</a>` : null;
  const items: FollowUp[] = [];

  if (discountEndsAt !== null && discountPercent > 0) {
    const ends = dateTime.format(discountEndsAt);
    items.push({
      id: "offer.reminder",
      sendAt: discountEndsAt - 12 * HOUR,
      email: letter(
        [
          escapeHtml(greeting(firstName)),
          `Csak egy gyors emlékeztető: a −${discountPercent}% gyors döntés kedvezményed <b>${escapeHtml(ends)}-ig</b> érvényes a ${escapeHtml(packageName)} csomagra.`,
          `Ha addig az ajánlatod alján kérsz egy ingyenes egyeztetést, a kedvezményes ár rögzül – a döntést ráérsz az egyeztetés után meghozni.${linkHtml ? ` ${linkHtml}` : ""}`,
        ],
        [
          greeting(firstName),
          `Csak egy gyors emlékeztető: a −${discountPercent}% gyors döntés kedvezményed ${ends}-ig érvényes a ${packageName} csomagra.`,
          `Ha addig az ajánlatod alján kérsz egy ingyenes egyeztetést, a kedvezményes ár rögzül.${shareUrl ? ` Az ajánlatod: ${shareUrl}` : ""}`,
        ],
        `Hamarosan lejár a −${discountPercent}% kedvezményed`,
      ),
    });
  }

  items.push({
    id: "offer.questions",
    sendAt: now + 3 * DAY,
    email: letter(
      [
        escapeHtml(greeting(firstName)),
        "Az ajánlatkérés után ezt a három kérdést kapom a legtöbbször, gondoltam, leírom:",
        "<b>Tényleg ennyibe kerül?</b> Az online ár a válaszaidból számolt becslés. A 30 perces egyeztetés után fix árat adok, és pluszmunka csak a jóváhagyásoddal kerül bele.",
        "<b>Kié lesz az oldal?</b> A tiéd: a domain, a kód és a tartalom is a te nevedre szól, bármikor továbbviheted.",
        "<b>Mi van, ha nincs kész szövegem vagy képem?</b> Nem baj, ebben is segítek – az egyeztetésen megbeszéljük, mi kell.",
        `Ha bármi más kérdésed van, írj vissza erre a levélre.${linkHtml ? ` ${linkHtml}` : ""}`,
      ],
      [
        greeting(firstName),
        "Az ajánlatkérés után ezt a három kérdést kapom a legtöbbször:",
        "Tényleg ennyibe kerül? Az online ár a válaszaidból számolt becslés. A 30 perces egyeztetés után fix árat adok, és pluszmunka csak a jóváhagyásoddal kerül bele.",
        "Kié lesz az oldal? A tiéd: a domain, a kód és a tartalom is a te nevedre szól.",
        "Mi van, ha nincs kész szövegem vagy képem? Nem baj, ebben is segítek.",
        `Ha bármi más kérdésed van, írj vissza erre a levélre.${shareUrl ? ` Az ajánlatod: ${shareUrl}` : ""}`,
      ],
      "3 kérdés, amit az ajánlat után a legtöbben feltesznek",
    ),
  });

  items.push({
    id: "offer.checkin",
    sendAt: now + 7 * DAY,
    email: letter(
      [
        escapeHtml(greeting(firstName)),
        `Egy hete kérted az ajánlatot a ${escapeHtml(packageName)} csomagra. Áll még a terv?`,
        "Ha igen, válaszolj egy szóval erre a levélre, és egyeztetünk egy rövid hívást. Ha közben változott valami (más határidő, kisebb vagy nagyobb kör), azt is szívesen átszámolom.",
      ],
      [
        greeting(firstName),
        `Egy hete kérted az ajánlatot a ${packageName} csomagra. Áll még a terv?`,
        "Ha igen, válaszolj egy szóval erre a levélre, és egyeztetünk egy rövid hívást. Ha közben változott valami, azt is szívesen átszámolom.",
      ],
      "Áll még a terv?",
    ),
  });

  return keep(items, now);
}

/** After the free audit report: what fixing would cost (day 2), and a re-check (day 28). */
export function auditFollowUps({ now, url }: AuditFollowUpInput): FollowUp[] {
  let host = url;
  try {
    host = new URL(url).hostname;
  } catch {
    // keep the raw value
  }
  const redesignUrl = `${siteUrl}/weboldal-felujitas`;
  const auditUrl = `${siteUrl}/atvilagitas`;
  return keep(
    [
      {
        id: "audit.cost",
        sendAt: now + 2 * DAY,
        email: letter(
          [
            "Szia!",
            `Pár napja átvilágítottad a(z) <b>${escapeHtml(host)}</b> oldalt. Ha kíváncsi vagy, mennyibe kerülne kijavítani vagy felújítani, a kérdőív pár perc alatt tételesen kiszámolja: <a href="${redesignUrl}" style="color:#14161A;font-weight:bold;">felújítás ára</a>.`,
            "Ha inkább csak egy-két hibát javítanál, írd meg válaszban, melyiket – megmondom, mennyi munka.",
          ],
          [
            "Szia!",
            `Pár napja átvilágítottad a(z) ${host} oldalt. Ha kíváncsi vagy, mennyibe kerülne kijavítani vagy felújítani: ${redesignUrl}`,
            "Ha inkább csak egy-két hibát javítanál, írd meg válaszban, melyiket – megmondom, mennyi munka.",
          ],
          `Mennyibe kerülne kijavítani: ${host}`,
        ),
      },
      {
        id: "audit.recheck",
        sendAt: now + 28 * DAY,
        email: letter(
          [
            "Szia!",
            `Egy hónapja nézted meg a(z) <b>${escapeHtml(host)}</b> átvilágítását. Ha azóta változott valami az oldalon, 30 másodperc alatt újra lemérheted: <a href="${auditUrl}" style="color:#14161A;font-weight:bold;">új átvilágítás</a>.`,
          ],
          ["Szia!", `Egy hónapja nézted meg a(z) ${host} átvilágítását. Ha azóta változott valami, újra lemérheted: ${auditUrl}`],
          `Hogy áll most a(z) ${host}?`,
        ),
      },
    ],
    now,
  );
}
