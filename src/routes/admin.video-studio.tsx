import { createFileRoute } from "@tanstack/react-router";
import VideoStudio from "@/pages/admin/VideoStudio";

export const Route = createFileRoute("/admin/video-studio")({
  ssr: false,
  component: VideoStudio,
});
