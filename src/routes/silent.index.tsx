import { createFileRoute } from "@tanstack/react-router";
import Silent from "@/pages/Silent";

export const Route = createFileRoute("/silent/")({
  component: Silent,
});
