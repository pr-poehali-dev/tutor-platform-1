import { createFileRoute } from "@tanstack/react-router";
import AiHelperStudio from "@/pages/AiHelperStudio";

export const Route = createFileRoute("/ai-helper")({
  component: AiHelperStudio,
});
