import { createFileRoute } from "@tanstack/react-router";
import SchoolPilotDeck from "@/pages/SchoolPilotDeck";

export const Route = createFileRoute("/for-schools/presentation/")({
  component: SchoolPilotDeck,
});
