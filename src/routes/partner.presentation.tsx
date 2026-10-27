import { createFileRoute } from "@tanstack/react-router";
import PartnersDeck from "@/pages/decks/PartnersDeck";

export const Route = createFileRoute("/partner/presentation")({
  component: PartnersDeck,
});
