import { createFileRoute } from "@tanstack/react-router";
import PilotSchoolStats from "@/pages/pilot/PilotSchoolStats";

export const Route = createFileRoute("/podklyuchit-shkolu/moya")({
  ssr: false,
  component: PilotSchoolStats,
});
