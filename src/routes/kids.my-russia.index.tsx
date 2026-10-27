import { createFileRoute } from "@tanstack/react-router";
import MyRussia from "@/pages/MyRussia";

export const Route = createFileRoute("/kids/my-russia/")({
  component: MyRussia,
});
