import { createFileRoute } from "@tanstack/react-router";
import PilotSchoolLeaflet from "@/pages/pilot/PilotSchoolLeaflet";

export const Route = createFileRoute("/s/$code/pamyatka")({
  component: PilotSchoolLeaflet,
});
