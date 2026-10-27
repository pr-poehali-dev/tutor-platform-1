import { createFileRoute } from "@tanstack/react-router";
import TutorScout from "@/pages/admin/TutorScout";

export const Route = createFileRoute("/admin/tutor-scout")({
  ssr: false,
  component: TutorScout,
});
