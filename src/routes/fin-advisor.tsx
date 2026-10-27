import { createFileRoute } from "@tanstack/react-router";
import FinAdvisor from "@/pages/FinAdvisor";

export const Route = createFileRoute("/fin-advisor")({
  component: FinAdvisor,
});
