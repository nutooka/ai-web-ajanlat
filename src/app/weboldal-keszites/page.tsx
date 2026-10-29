import { ServicePage, serviceMetadata } from "@/features/services/ServicePage";

export const metadata = serviceMetadata("company");

export default function Page() {
  return <ServicePage type="company" />;
}
