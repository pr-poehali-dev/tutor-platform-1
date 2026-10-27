import { createFileRoute } from "@tanstack/react-router";
import SimPlay from "@/pages/simulators/SimPlay";

export const Route = createFileRoute("/trenazhery/t/$slug")({
  component: SimPlay,
});
