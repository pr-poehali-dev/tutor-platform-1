import { createFileRoute } from "@tanstack/react-router";
import PromoDobro from "@/pages/PromoDobro";

export const Route = createFileRoute("/promo/dobro")({
  component: PromoDobro,
});
