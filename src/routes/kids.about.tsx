import { createFileRoute } from "@tanstack/react-router";
import KidsAbout from "@/pages/KidsAbout";

export const Route = createFileRoute("/kids/about")({
  component: KidsAbout,
});
