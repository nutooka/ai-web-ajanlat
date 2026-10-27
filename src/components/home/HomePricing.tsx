"use client";

import { useMemo } from "react";
import { PricingCards } from "@/features/offer/components/PricingCards";
import { calculateQuote } from "@/features/pricing/engine";
import { SAMPLE_COMPANY_ANSWERS } from "@/features/pricing/startingPrice";

/** The three packages for a typical company website – real numbers from the pricing engine. */
export function HomePricing() {
  const quote = useMemo(() => calculateQuote(SAMPLE_COMPANY_ANSWERS)!, []);
  return <PricingCards quote={quote} mode="home" />;
}
