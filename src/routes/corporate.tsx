import { createFileRoute } from "@tanstack/react-router";
import Corporate from "@/pages/Corporate";

export const Route = createFileRoute("/corporate")({
  component: Corporate,
});
