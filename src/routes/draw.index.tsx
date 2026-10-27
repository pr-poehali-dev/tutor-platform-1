import { createFileRoute } from "@tanstack/react-router";
import DrawLanding from "@/pages/DrawLanding";

export const Route = createFileRoute("/draw/")({
  component: DrawLanding,
});
