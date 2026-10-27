import { createFileRoute } from "@tanstack/react-router";
import SchoolsCity from "@/pages/schools/SchoolsCity";

export const Route = createFileRoute("/shkoly/gorod/$city")({
  component: SchoolsCity,
});
