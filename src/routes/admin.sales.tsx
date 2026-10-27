import { createFileRoute } from "@tanstack/react-router";
import SalesDashboard from "@/pages/admin/SalesDashboard";

export const Route = createFileRoute("/admin/sales")({
  ssr: false,
  component: SalesDashboard,
});
