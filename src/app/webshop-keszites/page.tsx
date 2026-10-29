import { ServicePage, serviceMetadata } from "@/features/services/ServicePage";

export const metadata = serviceMetadata("webshop");

export default function Page() {
  return <ServicePage type="webshop" />;
}
