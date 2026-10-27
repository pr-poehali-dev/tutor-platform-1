import { createFileRoute } from "@tanstack/react-router";
import SchoolBuilder from "@/pages/SchoolBuilder";

export const Route = createFileRoute("/school-builder")({
  component: SchoolBuilder,
});
