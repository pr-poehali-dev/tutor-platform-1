import { createFileRoute } from "@tanstack/react-router";
import SimMine from "@/pages/simulators/SimMine";

export const Route = createFileRoute("/trenazhery/moi")({
  ssr: false,
  component: SimMine,
});
