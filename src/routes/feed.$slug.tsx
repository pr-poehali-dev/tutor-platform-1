import { createFileRoute } from "@tanstack/react-router";
import FeedArticle from "@/pages/FeedArticle";

export const Route = createFileRoute("/feed/$slug")({
  component: FeedArticle,
});
