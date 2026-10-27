import { createFileRoute } from "@tanstack/react-router";
import PilotStudent from "@/pages/pilot/PilotStudent";

export const Route = createFileRoute("/s/$code/")({
  component: PilotStudent,
});
