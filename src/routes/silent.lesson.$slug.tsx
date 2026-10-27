import { createFileRoute } from "@tanstack/react-router";
import SilentLesson from "@/pages/SilentLesson";

export const Route = createFileRoute("/silent/lesson/$slug")({
  component: SilentLesson,
});
