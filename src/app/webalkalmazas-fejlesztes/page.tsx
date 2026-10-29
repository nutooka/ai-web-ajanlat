import { ServicePage, serviceMetadata } from "@/features/services/ServicePage";

export const metadata = serviceMetadata("webapp");

export default function Page() {
  return <ServicePage type="webapp" />;
}
