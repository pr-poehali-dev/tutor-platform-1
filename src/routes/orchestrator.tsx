import { createFileRoute } from "@tanstack/react-router";
import Orchestrator from "@/pages/Orchestrator";

export const Route = createFileRoute("/orchestrator")({
  component: Orchestrator,
});
