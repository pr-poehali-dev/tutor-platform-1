import { createFileRoute } from "@tanstack/react-router";
import KidsTopic from "@/pages/KidsTopic";

export const Route = createFileRoute("/kids/vopros/$topic")({
  component: KidsTopic,
});
