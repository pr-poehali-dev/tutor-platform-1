import { createFileRoute } from "@tanstack/react-router";
import AdultHome from "@/pages/AdultHome";

export const Route = createFileRoute("/vzroslym")({
  component: AdultHome,
});
