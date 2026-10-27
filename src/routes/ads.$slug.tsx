import { createFileRoute } from "@tanstack/react-router";
import AdLanding from "@/pages/ads/AdLanding";

export const Route = createFileRoute("/ads/$slug")({
  component: AdLanding,
});
