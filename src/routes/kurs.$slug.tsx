import { createFileRoute } from "@tanstack/react-router";
import CoursePublic from "@/pages/CoursePublic";

export const Route = createFileRoute("/kurs/$slug")({
  component: CoursePublic,
});
