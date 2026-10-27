import { createFileRoute } from "@tanstack/react-router";
import SchoolOffer from "@/pages/legal/SchoolOffer";

export const Route = createFileRoute("/legal/school-offer")({
  component: SchoolOffer,
});
