import { createFileRoute } from "@tanstack/react-router";
import SignDictionaryItem from "@/pages/SignDictionaryItem";

export const Route = createFileRoute("/dictionary/$key")({
  component: SignDictionaryItem,
});
