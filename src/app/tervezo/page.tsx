import type { Metadata } from "next";
import { Wizard } from "@/features/questionnaire/components/Wizard";

export const metadata: Metadata = {
  title: "Projekttervező",
  description: "Válaszolj néhány kérdésre, és azonnal kapsz egy személyre szabott, tételes árajánlatot.",
};

export default function PlannerPage() {
  return <Wizard />;
}
