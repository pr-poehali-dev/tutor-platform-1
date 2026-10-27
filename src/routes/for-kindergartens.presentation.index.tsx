import { createFileRoute } from "@tanstack/react-router";
import KidsPilotDeck from "@/pages/KidsPilotDeck";

export const Route = createFileRoute("/for-kindergartens/presentation/")({
  component: KidsPilotDeck,
});
