import { createFileRoute } from "@tanstack/react-router";
import KidsLanding from "@/pages/Kids";

export const Route = createFileRoute("/kids/")({
  component: KidsLanding,
});
