import { pricingConfig } from "@/config/pricing";

/** Short note next to the maintenance price: recommended, first month free, cancellable. */
export function supportNote(config = pricingConfig): string {
  return ["ajánlott", config.maintenance.firstMonthFree ? "első hónap ingyen" : null, "havonta lemondható"].filter(Boolean).join(", ");
}
