import { ServicePage, serviceMetadata } from "@/features/services/ServicePage";

export const metadata = serviceMetadata("landing");

export default function Page() {
  return <ServicePage type="landing" />;
}
