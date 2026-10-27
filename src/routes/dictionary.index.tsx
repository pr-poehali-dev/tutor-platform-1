import { createFileRoute } from "@tanstack/react-router";
import SignDictionary from "@/pages/SignDictionary";

export const Route = createFileRoute("/dictionary/")({
  component: SignDictionary,
});
