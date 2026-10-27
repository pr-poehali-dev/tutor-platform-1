import { createFileRoute } from "@tanstack/react-router";
import ParentsDeck from "@/pages/decks/ParentsDeck";

export const Route = createFileRoute("/parents/presentation")({
  component: ParentsDeck,
});
