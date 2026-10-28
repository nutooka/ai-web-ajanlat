import { siteConfig } from "@/config/site";

/** What the price includes tax-wise – shown under every total. */
export function vatNote(): string {
  const { vat } = siteConfig.company;
  return vat.registered ? `nettó ár, + ${vat.rate}% ÁFA` : "végső ár – nem kerül rá ÁFA";
}

/** How long the fixed (discounted) price holds after a call is requested. */
export function validityNote(): string {
  return `A rögzített ár az egyeztetés kérésétől ${siteConfig.offerValidityDays} napig érvényes.`;
}
