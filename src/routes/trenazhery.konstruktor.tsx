import { createFileRoute } from "@tanstack/react-router";
import SimBuilder from "@/pages/simulators/SimBuilder";

export const Route = createFileRoute("/trenazhery/konstruktor")({
  component: SimBuilder,
});
