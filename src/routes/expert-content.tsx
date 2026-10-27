import { createFileRoute } from "@tanstack/react-router";
import ExpertContent from "@/pages/ExpertContent";

export const Route = createFileRoute("/expert-content")({
  component: ExpertContent,
});
