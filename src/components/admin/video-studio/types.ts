import { VideoScene } from "@/components/video/VideoStudioPlayer";

export const PROJECTS_KEY = "uchispro_video_projects_v1";

export interface Project {
  id: string;
  title: string;
  topic: string;
  style: string;
  duration_sec: number;
  scenes: VideoScene[];
  createdAt: number;
}

export const STYLES = [
  { id: "realistic", label: "Реалистичный", emoji: "📷" },
  { id: "cartoon", label: "Мультяшный 3D", emoji: "🎨" },
  { id: "flat", label: "Плоская графика", emoji: "📐" },
  { id: "sketch", label: "Карандашный набросок", emoji: "✏️" },
  { id: "cosmic", label: "Космический", emoji: "🌌" },
];

export const VOICES = [
  { id: "nika", label: "Ника (тёплый ж)" },
  { id: "sofia", label: "София (живой ж)" },
  { id: "alex", label: "Алекс (уверенный м)" },
  { id: "dmitry", label: "Дмитрий (спокойный м)" },
  { id: "fox", label: "Лиса (ласковый)" },
];

export const DURATIONS = [30, 60, 90, 120, 180];

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]) {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch { /* noop */ }
}
