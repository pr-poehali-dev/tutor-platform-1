import { createFileRoute } from "@tanstack/react-router";
import CourseCheckout from "@/pages/CourseCheckout";

export const Route = createFileRoute("/course-checkout/$courseId")({
  component: CourseCheckout,
});
