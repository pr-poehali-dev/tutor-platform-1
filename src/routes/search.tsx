import { createFileRoute } from "@tanstack/react-router";
import SearchResults from "@/pages/SearchResults";

export const Route = createFileRoute("/search")({
  component: SearchResults,
});
