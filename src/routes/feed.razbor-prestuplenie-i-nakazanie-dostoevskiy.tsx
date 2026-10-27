import { createFileRoute } from "@tanstack/react-router";
import PremiumPrestuplenie from "@/pages/PremiumPrestuplenie";

export const Route = createFileRoute("/feed/razbor-prestuplenie-i-nakazanie-dostoevskiy")({
  component: PremiumPrestuplenie,
});
