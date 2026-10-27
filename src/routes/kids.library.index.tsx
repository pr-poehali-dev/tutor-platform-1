import { createFileRoute } from "@tanstack/react-router";
import KidsLibrary from "@/pages/KidsLibrary";

export const Route = createFileRoute("/kids/library/")({
  component: KidsLibrary,
});
