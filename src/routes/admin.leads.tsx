import { createFileRoute } from "@tanstack/react-router";
import Leads from "@/pages/admin/Leads";

export const Route = createFileRoute("/admin/leads")({
  ssr: false,
  component: Leads,
});
