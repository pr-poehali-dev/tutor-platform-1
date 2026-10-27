import { createFileRoute } from "@tanstack/react-router";
import KsushaEngine from "@/pages/admin/KsushaEngine";

export const Route = createFileRoute("/admin/ksusha-engine")({
  ssr: false,
  component: KsushaEngine,
});
