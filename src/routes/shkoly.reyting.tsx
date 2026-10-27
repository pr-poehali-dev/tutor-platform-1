import { createFileRoute } from "@tanstack/react-router";
import SchoolsRating from "@/pages/schools/SchoolsRating";

export const Route = createFileRoute("/shkoly/reyting")({
  component: SchoolsRating,
});
