import { createFileRoute } from "@tanstack/react-router";
import Olympiad from "@/pages/Olympiad";

export const Route = createFileRoute("/olympiad")({
  component: Olympiad,
});
