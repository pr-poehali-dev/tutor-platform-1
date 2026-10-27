import { createFileRoute } from "@tanstack/react-router";
import PersonalBrand from "@/pages/PersonalBrand";

export const Route = createFileRoute("/personal-brand")({
  component: PersonalBrand,
});
