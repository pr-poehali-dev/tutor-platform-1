import { createFileRoute } from "@tanstack/react-router";
import CoursesContent from "@/pages/admin/CoursesContent";

export const Route = createFileRoute("/admin/courses-content")({
  ssr: false,
  component: CoursesContent,
});
