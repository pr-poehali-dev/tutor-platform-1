import { createFileRoute } from "@tanstack/react-router";
import SchoolHome from "@/pages/SchoolHome";

export const Route = createFileRoute("/shkola")({
  component: SchoolHome,
});
