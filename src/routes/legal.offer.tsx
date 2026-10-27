import { createFileRoute } from "@tanstack/react-router";
import Offer from "@/pages/legal/Offer";

export const Route = createFileRoute("/legal/offer")({
  component: Offer,
});
