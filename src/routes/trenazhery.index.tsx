import { createFileRoute } from "@tanstack/react-router";
import SimCatalog from "@/pages/simulators/SimCatalog";

export const Route = createFileRoute("/trenazhery/")({
  component: SimCatalog,
});
