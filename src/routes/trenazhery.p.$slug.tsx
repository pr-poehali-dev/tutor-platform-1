import { createFileRoute } from "@tanstack/react-router";
import SimPlay from "@/pages/simulators/SimPlay";

function SimPlayPage() {
  return <SimPlay saved />;
}

export const Route = createFileRoute("/trenazhery/p/$slug")({
  component: SimPlayPage,
});
