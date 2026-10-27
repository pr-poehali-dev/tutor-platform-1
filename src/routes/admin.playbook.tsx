import { createFileRoute } from "@tanstack/react-router";
import SalesPlaybook from "@/pages/admin/SalesPlaybook";

export const Route = createFileRoute("/admin/playbook")({
  ssr: false,
  component: SalesPlaybook,
});
