import { buildOffer } from "@/features/offer/buildOffer";
import { isComplete, pruneAnswers } from "@/features/questionnaire/engine";
import type { PackageId } from "@/features/pricing/types";
import type { Answers } from "@/features/questionnaire/types";
import { contactKeys, type FirstSeenStore } from "./contactLock";
import { customerEmail, ownerEmail, type EmailContent, type SubmissionMeta } from "./email/templates";
import { submissionSchema } from "./schema";
import { checkSpamSignals } from "./spam";

export interface OutgoingEmail extends EmailContent {
  to: string;
  replyTo?: string;
}

export type EmailSender = (email: OutgoingEmail) => Promise<void>;

export type SubmitResult =
  | { status: 200; body: { ok: true; copySent: boolean } }
  | { status: 400 | 422 | 500 | 503; body: { ok: false; error: string; fieldErrors?: Record<string, string> } };

export interface SubmitDeps {
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

  const { answers: rawAnswers, packageId, contact, website, elapsedMs } = parsed.data;

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
    return { status: 503, body: { ok: false, error: "Az e-mail-küldés jelenleg nem elérhető. Kérjük, próbáld később, vagy keress minket közvetlenül." } };
  }

  try {
    const shareUrl = deps.shareLink ? await deps.shareLink(answers, packageId, offerAgeMinutes).catch(() => null) : null;
    const meta: SubmissionMeta = { submittedAt: now, offerOpenedAt: effectiveOpenedAt, offerAgeMinutes, lock, shareUrl };
    await deps.send({ ...ownerEmail(offer, packageId, contact, meta), to: deps.ownerEmail, replyTo: contact.email });
  } catch (error) {
    console.error("[offer] owner e-mail failed", error);
    return { status: 500, body: { ok: false, error: "Nem sikerült elküldeni az ajánlatot. Kérjük, próbáld újra néhány perc múlva." } };
  }

  let copySent = false;
  if (contact.wantsCopy && contact.email) {
    try {
      await deps.send({ ...customerEmail(offer, packageId, contact), to: contact.email });
      copySent = true;
    } catch (error) {
      // The owner already has the request; a failed copy should not fail the whole submission.
      console.error("[offer] customer copy failed", error);
    }
  }

  return { status: 200, body: { ok: true, copySent } };
}
