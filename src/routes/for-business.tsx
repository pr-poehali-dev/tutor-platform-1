import { createFileRoute } from "@tanstack/react-router";
import ForBusiness from "@/pages/ForBusiness";

export const Route = createFileRoute("/for-business")({
  component: ForBusiness,
});
