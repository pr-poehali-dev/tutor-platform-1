import { createFileRoute } from "@tanstack/react-router";
import Privacy from "@/pages/legal/Privacy";

export const Route = createFileRoute("/legal/privacy")({
  component: Privacy,
});
