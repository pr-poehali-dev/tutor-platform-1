import { createFileRoute } from "@tanstack/react-router";
import TechTrends from "@/pages/TechTrends";

export const Route = createFileRoute("/tech-trends")({
  component: TechTrends,
});
