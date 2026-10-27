import { createFileRoute } from "@tanstack/react-router";
import MathProblems from "@/pages/MathProblems";

export const Route = createFileRoute("/math-problems")({
  component: MathProblems,
});
