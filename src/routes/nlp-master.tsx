import { createFileRoute } from "@tanstack/react-router";
import NlpMaster from "@/pages/NlpMaster";

export const Route = createFileRoute("/nlp-master")({
  component: NlpMaster,
});
