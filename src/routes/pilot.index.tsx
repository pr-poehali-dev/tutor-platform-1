import { createFileRoute } from "@tanstack/react-router";
import PilotCities from "@/pages/PilotCities";

export const Route = createFileRoute("/pilot/")({
  component: PilotCities,
});
