import { createFileRoute } from "@tanstack/react-router";
import StudentLeaflet from "@/pages/StudentLeaflet";

export const Route = createFileRoute("/leaflet/shkolniki")({
  component: StudentLeaflet,
});
