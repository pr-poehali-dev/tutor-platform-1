import { createFileRoute } from "@tanstack/react-router";
import WritingCraft from "@/pages/WritingCraft";

export const Route = createFileRoute("/writing-craft")({
  component: WritingCraft,
});
