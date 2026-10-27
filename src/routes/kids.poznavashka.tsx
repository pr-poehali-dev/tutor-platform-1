import { createFileRoute } from "@tanstack/react-router";
import KidsPoznavashka from "@/pages/KidsPoznavashka";

export const Route = createFileRoute("/kids/poznavashka")({
  component: KidsPoznavashka,
});
