import { createFileRoute } from "@tanstack/react-router";
import SchoolsHome from "@/pages/schools/SchoolsHome";

export const Route = createFileRoute("/shkoly/")({
  component: SchoolsHome,
});
