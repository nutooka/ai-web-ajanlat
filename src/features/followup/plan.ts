import { siteUrl } from "@/config/site";
import { escapeHtml, type EmailContent } from "@/features/contact/email/templates";
import { brandedEmail, STOP_URL_PLACEHOLDER } from "./layout";

export { STOP_URL_PLACEHOLDER };

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
  const offerCta = { label: "Az ajánlatom megnyitása", url: shareUrl ?? `${siteUrl}/tervezo` };
  const eyebrow = `Ajánlatod · ${packageName} csomag`;
  const items: FollowUp[] = [];

  if (discountEndsAt !== null && discountPercent > 0) {
    const ends = dateTime.format(discountEndsAt);
    items.push({
      id: "offer.reminder",
      sendAt: discountEndsAt - 12 * HOUR,
      email: brandedEmail({
        subject: `Hamarosan lejár a −${discountPercent}% kedvezményed`,
        preheader: `${ends}-ig kérhetsz egyeztetést a kedvezményes áron.`,
        eyebrow,
        heading: "Hamarosan lejár a kedvezményed",
        highlight: `−${discountPercent}% gyors döntés kedvezmény · ${ends}-ig`,
        greeting: greeting(firstName),
        paragraphs: [
          `Csak egy gyors emlékeztető: a kedvezményed ${ends}-ig érvényes a ${packageName} csomagra.`,
          "Ha addig az ajánlatod alján kérsz egy ingyenes egyeztetést, a kedvezményes árat rögzítjük. A döntést ráérsz az egyeztetés után meghozni.",
        ],
        cta: offerCta,
      }),
    });
  }

  items.push({
    id: "offer.questions",
    sendAt: now + 3 * DAY,
    email: brandedEmail({
      subject: "3 kérdés, amit az ajánlat után a legtöbben feltesznek",
      preheader: "Tényleg ennyibe kerül? Kié lesz az oldal? Mi van, ha nincs kész szövegem?",
      eyebrow,
      heading: "3 kérdés, amit a legtöbben feltesznek",
      greeting: greeting(firstName),
      paragraphs: ["Az ajánlatkérés után ezt a három kérdést kapjuk a legtöbbször, gondoltuk, leírjuk:"],
      qa: [
        { q: "Tényleg ennyibe kerül?", a: "Az online ár a válaszaidból számolt becslés. A 30 perces egyeztetés után fix árat adunk, és pluszmunka csak a jóváhagyásoddal kerül bele." },
        { q: "Kié lesz az oldal?", a: "A tiéd: a domain, a kód és a tartalom is a te nevedre szól, bármikor továbbviheted." },
        { q: "Mi van, ha nincs kész szövegem vagy képem?", a: "Nem baj, ebben is segítünk. Az egyeztetésen megbeszéljük, mi kell." },
      ],
      cta: offerCta,
      after: ["Ha bármi más kérdésed van, írj vissza erre a levélre."],
    }),
  });

  items.push({
    id: "offer.checkin",
    sendAt: now + 7 * DAY,
    email: brandedEmail({
      subject: "Áll még a terv?",
      preheader: "Egy hete kérted az ajánlatot. Egy szó is elég válaszként.",
      eyebrow,
      heading: "Áll még a terv?",
      greeting: greeting(firstName),
      paragraphs: [
        `Egy hete kérted az ajánlatot a ${packageName} csomagra.`,
        "Ha még aktuális, válaszolj egy szóval erre a levélre, és egyeztetünk egy rövid hívást. Ha közben változott valami (más határidő, kisebb vagy nagyobb kör), azt is szívesen átszámoljuk.",
      ],
      cta: offerCta,
    }),
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
  const eyebrow = `Átvilágítás · ${host}`;
  return keep(
    [
      {
        id: "audit.cost",
        sendAt: now + 2 * DAY,
        email: brandedEmail({
          subject: `Mennyibe kerülne kijavítani: ${host}`,
          preheader: "A kérdőív pár perc alatt tételesen kiszámolja a felújítás árát.",
          eyebrow,
          heading: "Mennyibe kerülne kijavítani?",
          greeting: "Szia!",
          paragraphs: [
            `Pár napja átvilágítottad a(z) ${host} oldalt. Ha kíváncsi vagy, mennyibe kerülne kijavítani vagy felújítani, a kérdőív pár perc alatt tételesen kiszámolja.`,
          ],
          cta: { label: "Kiszámolom a felújítás árát", url: `${siteUrl}/weboldal-felujitas` },
          after: ["Ha inkább csak egy-két hibát javítanál, írd meg válaszban, melyiket, és megmondjuk, mennyi munka."],
        }),
      },
      {
        id: "audit.recheck",
        sendAt: now + 28 * DAY,
        email: brandedEmail({
          subject: `Hogy áll most a(z) ${host}?`,
          preheader: "30 másodperc alatt újra lemérheted az oldalad.",
          eyebrow,
          heading: "Nézzük meg újra?",
          greeting: "Szia!",
          paragraphs: [`Egy hónapja nézted meg a(z) ${host} átvilágítását. Ha azóta változott valami az oldalon, 30 másodperc alatt újra lemérheted.`],
          cta: { label: "Új átvilágítás", url: `${siteUrl}/atvilagitas` },
        }),
      },
    ],
    now,
  );
}
