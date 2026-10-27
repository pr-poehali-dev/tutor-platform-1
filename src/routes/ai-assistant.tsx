import { createFileRoute } from "@tanstack/react-router";
import AiAssistant from "@/pages/AiAssistant";

export const Route = createFileRoute("/ai-assistant")({
  component: AiAssistant,
});
