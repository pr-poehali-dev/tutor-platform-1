import { createFileRoute } from "@tanstack/react-router";
import GradeTutor from "@/pages/GradeTutor";

export const Route = createFileRoute("/repetitor/$grade")({
  component: GradeTutor,
});
