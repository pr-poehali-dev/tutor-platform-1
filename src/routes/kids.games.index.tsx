import { createFileRoute } from "@tanstack/react-router";
import KidsGames from "@/pages/KidsGames";

export const Route = createFileRoute("/kids/games/")({
  component: KidsGames,
});
