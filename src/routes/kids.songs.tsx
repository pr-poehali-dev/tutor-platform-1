import { createFileRoute } from "@tanstack/react-router";
import KidsSongs from "@/pages/KidsSongs";

export const Route = createFileRoute("/kids/songs")({
  component: KidsSongs,
});
