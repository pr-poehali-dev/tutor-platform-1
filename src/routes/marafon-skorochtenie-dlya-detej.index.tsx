import { createFileRoute } from "@tanstack/react-router";
import ReadingMarathon from "@/pages/ReadingMarathon";

function ReadingMarathonPage() {
  return <ReadingMarathon track="parent" />;
}

export const Route = createFileRoute("/marafon-skorochtenie-dlya-detej/")({
  component: ReadingMarathonPage,
});
