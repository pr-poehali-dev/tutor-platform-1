import { createFileRoute } from "@tanstack/react-router";
import BiologyProblems from "@/pages/BiologyProblems";

export const Route = createFileRoute("/biology-problems")({
  component: BiologyProblems,
});
