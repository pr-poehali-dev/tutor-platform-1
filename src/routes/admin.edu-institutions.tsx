import { createFileRoute } from "@tanstack/react-router";
import EduInstitutions from "@/pages/admin/EduInstitutions";

export const Route = createFileRoute("/admin/edu-institutions")({
  ssr: false,
  component: EduInstitutions,
});
