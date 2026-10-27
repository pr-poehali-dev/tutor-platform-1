import { createFileRoute } from "@tanstack/react-router";
import PremiumVoynaIMir from "@/pages/PremiumVoynaIMir";

export const Route = createFileRoute("/feed/razbor-voyna-i-mir-tolstoy")({
  component: PremiumVoynaIMir,
});
