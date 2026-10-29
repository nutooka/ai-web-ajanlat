/**
 * Funnel steps we count (once per visitor session each).
 * Questions are counted when shown, so the drop-off sits between two consecutive questions.
 */
export const FUNNEL_EVENTS = [
  "home_type_pick", // picked a project type on the home page
  "offer_view", // reached the offer page
  "offer_saved", // sent the offer to their own e-mail
  "chat_click", // opened Messenger / WhatsApp from the offer
  "consultation", // requested a consultation
] as const;

export type FunnelEvent = (typeof FUNNEL_EVENTS)[number];

/** `q:<questionId>` for a question view, or a named event. */
export type FunnelStep = `q:${string}` | FunnelEvent;

const QUESTION_ID = /^q:[a-zA-Z_]{1,40}$/;

export function isFunnelStep(value: unknown): value is FunnelStep {
  return typeof value === "string" && (QUESTION_ID.test(value) || (FUNNEL_EVENTS as readonly string[]).includes(value));
}
