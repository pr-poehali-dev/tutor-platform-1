import { createFileRoute } from "@tanstack/react-router";
import PromoVideo from "@/pages/PromoVideo";

export const Route = createFileRoute("/promo/video")({
  component: PromoVideo,
});
