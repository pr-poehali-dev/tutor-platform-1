import { createFileRoute } from "@tanstack/react-router";
import AdminFeed from "@/pages/admin/AdminFeed";

export const Route = createFileRoute("/admin/feed")({
  ssr: false,
  component: AdminFeed,
});
