import { createFileRoute } from "@tanstack/react-router";
import PartnerCabinet from "@/pages/PartnerCabinet";

export const Route = createFileRoute("/partner/")({
  ssr: false,
  component: PartnerCabinet,
});
