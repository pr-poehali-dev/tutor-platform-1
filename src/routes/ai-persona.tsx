import { createFileRoute } from "@tanstack/react-router";
import AiPersona from "@/pages/AiPersona";

export const Route = createFileRoute("/ai-persona")({
  component: AiPersona,
});
