import { createFileRoute } from "@tanstack/react-router";
import AdsManager from "@/pages/admin/AdsManager";

export const Route = createFileRoute("/admin/ads")({
  ssr: false,
  component: AdsManager,
});
