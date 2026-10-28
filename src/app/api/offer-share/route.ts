import { offerClockSecret } from "@/features/offer/offerClock";
import { parseShareInput, saveSharedOffer } from "@/features/offer/share";

const MAX_BODY_BYTES = 32 * 1024;

/** Returns the offer code for the visitor's answers (stores them for the link). */
export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return Response.json({ ok: false }, { status: 413 });
  let input: unknown;
  try {
    input = JSON.parse(raw);
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  const parsed = parseShareInput(input);
  if (!parsed) return Response.json({ ok: false }, { status: 400 });
  try {
    const code = await saveSharedOffer(parsed.answers, parsed.packageId, offerClockSecret());
    if (!code) return Response.json({ ok: false }, { status: 503 });
    return Response.json({ ok: true, code }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[offer-share] store failed", error);
    return Response.json({ ok: false }, { status: 503 });
  }
}
