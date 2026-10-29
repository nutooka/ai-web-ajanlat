import { ServicePage, serviceMetadata } from "@/features/services/ServicePage";

export const metadata = serviceMetadata("redesign");

export default function Page() {
  return <ServicePage type="redesign" />;
}
