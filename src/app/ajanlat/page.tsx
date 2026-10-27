import type { Metadata } from "next";
import { OfferView } from "@/features/offer/components/OfferView";

export const metadata: Metadata = {
  title: "Az ajánlatod",
  description: "Személyre szabott, tételes webfejlesztési árajánlat három csomagban.",
  robots: { index: false },
};

export default function OfferPage() {
  return <OfferView />;
}
