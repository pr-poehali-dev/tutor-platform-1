import { createFileRoute } from "@tanstack/react-router";
import SuperCourses from "@/pages/SuperCourses";

export const Route = createFileRoute("/super-courses")({
  component: SuperCourses,
});
