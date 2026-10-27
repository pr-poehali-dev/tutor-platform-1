import { createFileRoute } from "@tanstack/react-router";
import SchoolsForSchools from "@/pages/schools/SchoolsForSchools";

export const Route = createFileRoute("/shkoly/dlya-shkol")({
  component: SchoolsForSchools,
});
