import { siteConfig } from "@/config/site";

/** How long the fixed (discounted) price holds after a call is requested. */
export function validityNote(): string {
  return `A rögzített ár az egyeztetés kérésétől ${siteConfig.offerValidityDays} napig érvényes.`;
}
