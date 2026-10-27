import { createFileRoute } from "@tanstack/react-router";
import ForSchools from "@/pages/ForSchools";

export const Route = createFileRoute("/for-schools/")({
  component: ForSchools,
});
