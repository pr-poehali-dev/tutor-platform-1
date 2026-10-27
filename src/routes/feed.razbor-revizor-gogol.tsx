import { createFileRoute } from "@tanstack/react-router";
import PremiumRevizor from "@/pages/PremiumRevizor";

export const Route = createFileRoute("/feed/razbor-revizor-gogol")({
  component: PremiumRevizor,
});
