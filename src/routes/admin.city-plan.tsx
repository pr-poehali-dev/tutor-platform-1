import { createFileRoute } from "@tanstack/react-router";
import CityPlan from "@/pages/admin/CityPlan";

export const Route = createFileRoute("/admin/city-plan")({
  ssr: false,
  component: CityPlan,
});
