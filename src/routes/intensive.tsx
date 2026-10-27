import { createFileRoute } from "@tanstack/react-router";
import Intensive from "@/pages/Intensive";

export const Route = createFileRoute("/intensive")({
  component: Intensive,
});
