import { createFileRoute } from "@tanstack/react-router";
import SchoolProfileForm from "@/pages/schools/SchoolProfileForm";

export const Route = createFileRoute("/shkoly/anketa")({
  component: SchoolProfileForm,
});
