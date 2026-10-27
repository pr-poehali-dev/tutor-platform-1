import { createFileRoute } from "@tanstack/react-router";
import ForManagers from "@/pages/ForManagers";

export const Route = createFileRoute("/for-managers")({
  component: ForManagers,
});
