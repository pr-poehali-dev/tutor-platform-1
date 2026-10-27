import { createFileRoute } from "@tanstack/react-router";
import TutorsDeck from "@/pages/decks/TutorsDeck";

export const Route = createFileRoute("/repetitoram/presentation")({
  component: TutorsDeck,
});
