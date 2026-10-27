import { createFileRoute } from "@tanstack/react-router";
import GrantApplications from "@/pages/admin/GrantApplications";

export const Route = createFileRoute("/admin/grants")({
  ssr: false,
  component: GrantApplications,
});
