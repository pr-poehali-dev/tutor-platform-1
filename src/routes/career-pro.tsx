import { createFileRoute } from "@tanstack/react-router";
import CareerPro from "@/pages/CareerPro";

export const Route = createFileRoute("/career-pro")({
  component: CareerPro,
});
