import type { Metadata } from "next";
import { defaultOgImage } from "@/config/site";
import { Wizard } from "@/features/questionnaire/components/Wizard";
import { PlannerIntro } from "./PlannerIntro";

const title = "Weboldal árkalkulátor – azonnali, tételes ár";
const description = "Válaszolj néhány kérdésre a weboldaladról, webshopodról vagy webalkalmazásodról, és azonnal tételes árajánlatot kapsz RON-ban, három csomagban.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/tervezo" },
  openGraph: { title, description, url: "/tervezo", images: [defaultOgImage] },
};

export default function PlannerPage() {
  return (
    <>
      <Wizard />
      <PlannerIntro />
    </>
  );
}
