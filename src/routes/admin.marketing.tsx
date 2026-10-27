import { createFileRoute } from "@tanstack/react-router";
import MarketingDashboard from "@/pages/admin/MarketingDashboard";

export const Route = createFileRoute("/admin/marketing")({
  ssr: false,
  component: MarketingDashboard,
});
