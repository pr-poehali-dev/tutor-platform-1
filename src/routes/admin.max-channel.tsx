import { createFileRoute } from "@tanstack/react-router";
import MaxChannelDashboard from "@/pages/admin/MaxChannelDashboard";

export const Route = createFileRoute("/admin/max-channel")({
  ssr: false,
  component: MaxChannelDashboard,
});
