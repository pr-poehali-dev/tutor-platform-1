import { createFileRoute } from "@tanstack/react-router";
import KnowYourself from "@/pages/KnowYourself";

export const Route = createFileRoute("/know-yourself/")({
  component: KnowYourself,
});
