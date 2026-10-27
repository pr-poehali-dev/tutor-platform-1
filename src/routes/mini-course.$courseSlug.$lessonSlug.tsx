import { createFileRoute } from "@tanstack/react-router";
import MiniCourse from "@/pages/MiniCourse";

export const Route = createFileRoute("/mini-course/$courseSlug/$lessonSlug")({
  component: MiniCourse,
});
