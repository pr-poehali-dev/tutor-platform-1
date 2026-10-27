import { createFileRoute } from "@tanstack/react-router";
import SchoolProfilesAdmin from "@/pages/admin/SchoolProfilesAdmin";

export const Route = createFileRoute("/admin/school-profiles")({
  ssr: false,
  component: SchoolProfilesAdmin,
});
