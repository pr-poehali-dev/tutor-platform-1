import { createFileRoute } from "@tanstack/react-router";
import SamaraOutreach from "@/pages/admin/SamaraOutreach";

export const Route = createFileRoute("/admin/samara-outreach")({
  ssr: false,
  component: SamaraOutreach,
});
