import { createFileRoute } from "@tanstack/react-router";
import ReadingSpeedTest from "@/pages/ReadingSpeedTest";

export const Route = createFileRoute("/test-skorosti-chteniya")({
  component: ReadingSpeedTest,
});
