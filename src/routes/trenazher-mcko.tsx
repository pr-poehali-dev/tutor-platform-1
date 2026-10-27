import { createFileRoute } from "@tanstack/react-router";
import McKoTrainer from "@/pages/McKoTrainer";

export const Route = createFileRoute("/trenazher-mcko")({
  component: McKoTrainer,
});
