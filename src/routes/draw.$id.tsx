import { createFileRoute } from "@tanstack/react-router";
import DrawLesson from "@/pages/DrawLesson";

export const Route = createFileRoute("/draw/$id")({
  component: DrawLesson,
});
