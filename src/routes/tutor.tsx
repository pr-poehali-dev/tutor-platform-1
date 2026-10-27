import { createFileRoute } from "@tanstack/react-router";
import TutorHub from "@/pages/TutorHub";

export const Route = createFileRoute("/tutor")({
  component: TutorHub,
});
