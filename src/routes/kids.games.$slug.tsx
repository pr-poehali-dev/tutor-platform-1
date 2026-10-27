import { createFileRoute } from "@tanstack/react-router";
import KidsGamePlay from "@/pages/KidsGamePlay";

export const Route = createFileRoute("/kids/games/$slug")({
  component: KidsGamePlay,
});
