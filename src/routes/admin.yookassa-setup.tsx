import { createFileRoute } from "@tanstack/react-router";
import YookassaSetup from "@/pages/admin/YookassaSetup";

export const Route = createFileRoute("/admin/yookassa-setup")({
  ssr: false,
  component: YookassaSetup,
});
