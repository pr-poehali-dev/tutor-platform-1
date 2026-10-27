import { createFileRoute } from "@tanstack/react-router";
import WebmasterGuide from "@/pages/admin/WebmasterGuide";

export const Route = createFileRoute("/admin/webmaster")({
  ssr: false,
  component: WebmasterGuide,
});
