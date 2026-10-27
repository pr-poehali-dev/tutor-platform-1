import { createFileRoute } from "@tanstack/react-router";
import PremiumGeroy from "@/pages/PremiumGeroy";

export const Route = createFileRoute("/feed/razbor-geroy-nashego-vremeni-lermontov")({
  component: PremiumGeroy,
});
