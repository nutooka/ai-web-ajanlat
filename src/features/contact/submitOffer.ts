import { buildOffer } from "@/features/offer/buildOffer";
import { isComplete, pruneAnswers } from "@/features/questionnaire/engine";
import type { PackageId } from "@/features/pricing/types";
import type { Answers } from "@/features/questionnaire/types";
import { contactKeys, type FirstSeenStore } from "./contactLock";
import type { EmailContent } from "@/lib/email/html";
import { customerEmail, ownerEmail, type SubmissionMeta } from "./email/templates";
import { submissionSchema } from "./schema";
import { checkSpamSignals, type RecipientGuard } from "./spam";
import { offerFollowUps } from "@/features/followup/plan";
import { scheduleSequence, type FollowUpDeps, type ScheduledSequence } from "@/features/followup/sequence";

export interface OutgoingEmail extends EmailContent {
  to: string;
  replyTo?: string;
}

export type EmailSender = (email: OutgoingEmail) => Promise<void>;

type SubmitResult =
  | { status: 200; body: { ok: true; copySent: boolean } }
  | { status: 400 | 422 | 500 | 503; body: { ok: false; error: string; fieldErrors?: Record<string, string> } };

interface SubmitDeps {
  send: EmailSender | null;
  ownerEmail: string | undefined;
  /** Server-verified minutes since the offer was first opened (see offerClock). */
  offerAgeMinutes?: number;
  /** When the offer was first opened (signed cookie), null if unknown. */
  offerOpenedAt?: number | null;
  /** Injectable clock for tests. */
  now?: () => number;
  /** Per-contact "first seen" store (see contactLock); null when not configured. */
  firstSeen?: FirstSeenStore | null;
  /** Secret used to hash contacts for the store. */
  lockSecret?: string;
  /** Stores the offer and returns its public link (offer code); null/undefined when unavailable. */
  shareLink?: (answers: Answers, packageId: PackageId, offerAgeMinutes: number) => Promise<string | null>;
  /** Scheduled follow-up e-mails; null/undefined = none. */
  followUps?: FollowUpDeps | null;
  /** Per-address caps for mail to the visitor's address (see spam.ts); null/undefined = no cap. */
  recipients?: RecipientGuard | null;
  /** Runs non-critical work after the response (the route passes Next's `after`); default: inline. */
  defer?: (task: () => Promise<void>) => void;
}

/**
 * Framework-independent submission handler: validate → spam check → re-price on the server → send.
 * The client-side price is never trusted; the quote is rebuilt from the raw answers.
 */
export async function submitOffer(input: unknown, deps: SubmitDeps): Promise<SubmitResult> {
  const parsed = submissionSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".");
      if (!(path in fieldErrors)) fieldErrors[path] = issue.message;
    }
    return { status: 422, body: { ok: false, error: "Kérjük, ellenőrizd a megadott adatokat.", fieldErrors } };
  }

  const { answers: rawAnswers, packageId, contact, website, elapsedMs, intent } = parsed.data;
  const saving = intent === "save";
  if (saving && !contact.email) {
    return { status: 422, body: { ok: false, error: "Add meg az e-mail-címed.", fieldErrors: { "contact.email": "Add meg az e-mail-címed." } } };
  }

  // Pretend success to bots so they don't retry, but send nothing.
  if (!checkSpamSignals({ website, elapsedMs }).ok) return { status: 200, body: { ok: true, copySent: false } };

  const answers = pruneAnswers(rawAnswers);
  if (!isComplete(answers)) return { status: 400, body: { ok: false, error: "A kérdőív hiányos. Kérjük, töltsd ki újra." } };

  // Timing: the signed cookie, unless this contact already started a clock earlier (another browser, cleared cookies…).
  const now = (deps.now ?? Date.now)();
  const cookieOpenedAt = deps.offerOpenedAt ?? null;
  let effectiveOpenedAt = cookieOpenedAt;
  let lock: SubmissionMeta["lock"] = { status: "off" };
  if (deps.firstSeen && deps.lockSecret) {
    try {
      const result = await deps.firstSeen(contactKeys(contact, deps.lockSecret), cookieOpenedAt ?? now);
      if (result.firstSeenAt < (cookieOpenedAt ?? now)) effectiveOpenedAt = result.firstSeenAt;
      lock = { status: result.repeat ? "repeat" : "first", firstSeenAt: result.firstSeenAt };
    } catch (error) {
      console.error("[offer] first-seen store failed", error);
      lock = { status: "error" };
    }
  }
  const offerAgeMinutes =
    effectiveOpenedAt === null ? (deps.offerAgeMinutes ?? 0) : Math.max(0, (now - effectiveOpenedAt) / 60_000);

  const offer = buildOffer(answers, { offerAgeMinutes });
  if (!offer) return { status: 400, body: { ok: false, error: "A kérdőív hiányos. Kérjük, töltsd ki újra." } };

  if (!deps.send || !deps.ownerEmail) {
    return { status: 503, body: { ok: false, error: "Az e-mail-küldés jelenleg nem elérhető. Kérjük, próbáld később, vagy keress közvetlenül telefonon vagy WhatsAppon." } };
  }

  const shareUrl = deps.shareLink ? await deps.shareLink(answers, packageId, offerAgeMinutes).catch(() => null) : null;
  const ownerAddress = deps.ownerEmail;
  const send = deps.send;
  const runLater = async (task: () => Promise<void>) => {
    if (deps.defer) deps.defer(task);
    else await task();
  };

  // Mail to the visitor's address is capped per address, so the form cannot be used to flood someone else's inbox.
  const visitorEmail = contact.email;
  const wantsVisitorMail = Boolean(visitorEmail) && (saving || contact.wantsCopy);
  const visitorMailAllowed = visitorEmail && wantsVisitorMail ? await (deps.recipients?.allowEmail(visitorEmail) ?? true) : false;
  if (wantsVisitorMail && !visitorMailAllowed) console.warn("[offer] recipient limit reached, visitor e-mail skipped");
  // Saving is only about that e-mail: answer like a success, send nothing.
  if (saving && !visitorMailAllowed) return { status: 200, body: { ok: true, copySent: true } };

  // Follow-ups only to an e-mail address, and only once per contact (a repeat request already has a sequence).
  let followUp: ScheduledSequence | null = null;
  const followUpDeps = deps.followUps;
  if (followUpDeps && visitorEmail && lock.status !== "repeat" && (await (deps.recipients?.allowSequence(visitorEmail) ?? true))) {
    const quick = offer.quote.quickDecision;
    const discountRunning = saving && quick.percent > 0 && quick.minutesLeft !== null;
    const plan = offerFollowUps({
      now,
      discountEndsAt: discountRunning ? now + (quick.minutesLeft ?? 0) * 60_000 : null,
      discountPercent: quick.percent,
      packageName: offer.quote.packages[packageId].name,
      shareUrl,
      firstName: contact.name?.trim().split(/\s+/)[0] || undefined,
    });
    followUp = await scheduleSequence(plan, { to: visitorEmail, replyTo: ownerAddress }, followUpDeps).catch((error) => {
      console.error("[offer] follow-up scheduling failed", error);
      return null;
    });
  }
  const cancelFollowUps = async () => {
    if (followUp && followUpDeps) await Promise.allSettled(followUp.ids.map((id) => followUpDeps.cancel(id)));
  };
  const meta: SubmissionMeta = { submittedAt: now, offerOpenedAt: effectiveOpenedAt, offerAgeMinutes, lock, shareUrl, intent, followUp };

  // Saving: the visitor's own copy is the point, the owner only gets a heads-up (after the response).
  if (saving && visitorEmail) {
    try {
      await send({ ...customerEmail(offer, packageId, contact, { saved: true, shareUrl }), to: visitorEmail, replyTo: ownerAddress });
    } catch (error) {
      console.error("[offer] saved copy failed", error);
      await cancelFollowUps();
      return { status: 500, body: { ok: false, error: "Nem sikerült elküldeni az e-mailt. Kérjük, próbáld újra néhány perc múlva." } };
    }
    await runLater(async () => {
      try {
        await send({ ...ownerEmail(offer, packageId, contact, meta), to: ownerAddress, replyTo: visitorEmail });
      } catch (error) {
        console.error("[offer] owner heads-up failed", error);
      }
    });
    return { status: 200, body: { ok: true, copySent: true } };
  }

  // A consultation request: the owner e-mail is the request itself, so its failure is reported.
  try {
    await send({ ...ownerEmail(offer, packageId, contact, meta), to: ownerAddress, replyTo: visitorEmail });
  } catch (error) {
    console.error("[offer] owner e-mail failed", error);
    await cancelFollowUps();
    return { status: 500, body: { ok: false, error: "Nem sikerült elküldeni az ajánlatot. Kérjük, próbáld újra néhány perc múlva." } };
  }

  let copySent = false;
  if (visitorEmail && visitorMailAllowed) {
    try {
      await send({ ...customerEmail(offer, packageId, contact, { shareUrl }), to: visitorEmail, replyTo: ownerAddress });
      copySent = true;
    } catch (error) {
      // The owner already has the request; a failed copy should not fail the whole submission.
      console.error("[offer] customer copy failed", error);
    }
  }

  return { status: 200, body: { ok: true, copySent } };
}
