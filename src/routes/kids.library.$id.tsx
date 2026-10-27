import { createFileRoute } from "@tanstack/react-router";
import KidsLibraryItem from "@/pages/KidsLibraryItem";

export const Route = createFileRoute("/kids/library/$id")({
  component: KidsLibraryItem,
});
