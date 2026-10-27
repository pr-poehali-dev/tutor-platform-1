import { createFileRoute } from "@tanstack/react-router";
import TryLanding from "@/pages/TryLanding";

export const Route = createFileRoute("/start")({
  component: TryLanding,
});
