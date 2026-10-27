import { createFileRoute } from "@tanstack/react-router";
import ChemistryProblems from "@/pages/ChemistryProblems";

export const Route = createFileRoute("/chemistry-problems")({
  component: ChemistryProblems,
});
