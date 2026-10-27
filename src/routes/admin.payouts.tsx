import { createFileRoute } from "@tanstack/react-router";
import Payouts from "@/pages/admin/Payouts";

export const Route = createFileRoute("/admin/payouts")({
  ssr: false,
  component: Payouts,
});
