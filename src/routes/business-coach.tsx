import { createFileRoute } from "@tanstack/react-router";
import BusinessCoach from "@/pages/BusinessCoach";

export const Route = createFileRoute("/business-coach")({
  component: BusinessCoach,
});
