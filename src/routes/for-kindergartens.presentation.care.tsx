import { createFileRoute } from "@tanstack/react-router";
import KidsPilotDeck from "@/pages/KidsPilotDeck";

function KidsPilotDeckPage() {
  return <KidsPilotDeck mode="care" />;
}

export const Route = createFileRoute("/for-kindergartens/presentation/care")({
  component: KidsPilotDeckPage,
});
