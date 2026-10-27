import { createFileRoute } from "@tanstack/react-router";
import Psychology from "@/pages/Psychology";

export const Route = createFileRoute("/psychology")({
  component: Psychology,
});
