import { createFileRoute } from "@tanstack/react-router";
import SchoolPage from "@/pages/schools/SchoolPage";

export const Route = createFileRoute("/shkoly/$slug")({
  component: SchoolPage,
});
