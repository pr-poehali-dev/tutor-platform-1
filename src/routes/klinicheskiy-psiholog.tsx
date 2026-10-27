import { createFileRoute } from "@tanstack/react-router";
import ClinicalPsychologist from "@/pages/ClinicalPsychologist";

export const Route = createFileRoute("/klinicheskiy-psiholog")({
  component: ClinicalPsychologist,
});
