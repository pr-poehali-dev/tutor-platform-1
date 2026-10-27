import { createFileRoute } from "@tanstack/react-router";
import FreeCourses from "@/pages/FreeCourses";

export const Route = createFileRoute("/free-courses")({
  component: FreeCourses,
});
