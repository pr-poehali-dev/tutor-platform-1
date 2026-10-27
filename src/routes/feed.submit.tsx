import { createFileRoute } from "@tanstack/react-router";
import FeedSubmit from "@/pages/FeedSubmit";

export const Route = createFileRoute("/feed/submit")({
  component: FeedSubmit,
});
