import { createFileRoute } from "@tanstack/react-router";
import MyRussiaItem from "@/pages/MyRussiaItem";

export const Route = createFileRoute("/kids/my-russia/$id")({
  component: MyRussiaItem,
});
