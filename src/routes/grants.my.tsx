import { createFileRoute } from "@tanstack/react-router";
import GrantMy from "@/pages/GrantMy";

export const Route = createFileRoute("/grants/my")({
  ssr: false,
  component: GrantMy,
});
