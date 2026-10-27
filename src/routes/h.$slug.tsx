import { createFileRoute } from "@tanstack/react-router";
import AiHelperPublic from "@/pages/AiHelperPublic";

export const Route = createFileRoute("/h/$slug")({
  component: AiHelperPublic,
});
