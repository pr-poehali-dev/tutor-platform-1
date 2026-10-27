import { createFileRoute } from "@tanstack/react-router";
import ReadingMarathon from "@/pages/ReadingMarathon";

function ReadingMarathonPage() {
  return <ReadingMarathon track="teacher" />;
}

export const Route = createFileRoute("/marafon-skorochtenie-pedagogam/")({
  component: ReadingMarathonPage,
});
