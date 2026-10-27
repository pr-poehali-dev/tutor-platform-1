import { createFileRoute } from "@tanstack/react-router";
import Graduates from "@/pages/Graduates";

export const Route = createFileRoute("/graduates")({
  component: Graduates,
});
