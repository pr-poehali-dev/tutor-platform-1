import { createFileRoute } from "@tanstack/react-router";
import ScoreCalculator from "@/pages/ScoreCalculator";

export const Route = createFileRoute("/score-calculator")({
  component: ScoreCalculator,
});
