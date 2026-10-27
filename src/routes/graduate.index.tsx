import { createFileRoute } from "@tanstack/react-router";
import Graduate from "@/pages/Graduate";

export const Route = createFileRoute("/graduate/")({
  component: Graduate,
});
