import type { Metadata } from "next";
import { Wizard } from "@/features/questionnaire/components/Wizard";

export const metadata: Metadata = {
  title: "Weboldal árkalkulátor – kérdőív 3 perc alatt",
  description: "Válaszolj néhány kérdésre a weboldaladról, webshopodról vagy webalkalmazásodról, és azonnal tételes árajánlatot kapsz RON-ban, három csomagban.",
  alternates: { canonical: "/tervezo" },
};

export default function PlannerPage() {
  return <Wizard />;
}
