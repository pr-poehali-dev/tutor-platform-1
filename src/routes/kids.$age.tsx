import { createFileRoute } from "@tanstack/react-router";
import KidsAge from "@/pages/KidsAge";

export const Route = createFileRoute("/kids/$age")({
  component: KidsAge,
});
