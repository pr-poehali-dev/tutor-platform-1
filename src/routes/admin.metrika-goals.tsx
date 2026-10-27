import { createFileRoute } from "@tanstack/react-router";
import MetrikaGoals from "@/pages/admin/MetrikaGoals";

export const Route = createFileRoute("/admin/metrika-goals")({
  ssr: false,
  component: MetrikaGoals,
});
