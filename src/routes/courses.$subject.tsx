import { createFileRoute } from "@tanstack/react-router";
import SubjectLanding from "@/pages/SubjectLanding";

export const Route = createFileRoute("/courses/$subject")({
  component: SubjectLanding,
});
