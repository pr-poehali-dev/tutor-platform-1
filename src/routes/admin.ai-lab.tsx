import { createFileRoute } from "@tanstack/react-router";
import AIEvolutionLab from "@/pages/admin/AIEvolutionLab";

export const Route = createFileRoute("/admin/ai-lab")({
  ssr: false,
  component: AIEvolutionLab,
});
