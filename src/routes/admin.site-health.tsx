import { createFileRoute } from "@tanstack/react-router";
import SiteHealth from "@/pages/admin/SiteHealth";

export const Route = createFileRoute("/admin/site-health")({
  ssr: false,
  component: SiteHealth,
});
