import { createFileRoute } from "@tanstack/react-router";
import SchoolCoursePublic from "@/pages/SchoolCoursePublic";

export const Route = createFileRoute("/course/$id")({
  component: SchoolCoursePublic,
});
