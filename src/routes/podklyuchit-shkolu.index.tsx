import { createFileRoute } from "@tanstack/react-router";
import PilotJoin from "@/pages/pilot/PilotJoin";

export const Route = createFileRoute("/podklyuchit-shkolu/")({
  component: PilotJoin,
});
