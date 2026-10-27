import { createFileRoute } from "@tanstack/react-router";
import AppDownload from "@/pages/AppDownload";

export const Route = createFileRoute("/app")({
  component: AppDownload,
});
