import { createFileRoute } from "@tanstack/react-router";
import EduOutreach from "@/pages/admin/EduOutreach";

export const Route = createFileRoute("/admin/edu-outreach")({
  ssr: false,
  component: EduOutreach,
});
