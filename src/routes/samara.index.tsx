import { createFileRoute } from "@tanstack/react-router";
import SamaraPilot from "@/pages/SamaraPilot";

export const Route = createFileRoute("/samara/")({
  component: SamaraPilot,
});
