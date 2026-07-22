/**
 * Медиа живых ведущих платформы: фото (постер/фолбэк) и говорящее видео.
 * Индекс 0 — ведущая, 1 — ведущий. Выбор по id курса (чередование).
 */
export interface TutorMedia {
  name: string;
  photo: string;
  video: string;
}

export const TUTORS: TutorMedia[] = [
  {
    name: "Ведущая платформы",
    photo:
      "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/bucket/a45182ec-b299-4806-b29c-8d76fcc32ccf.jpg",
    video:
      "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/bucket/d4be93a7-7caa-4359-ba6c-0800c958c59a.mp4",
  },
  {
    name: "Ведущий платформы",
    photo:
      "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/bucket/8988d4b1-fa4c-45ca-a117-b7e4cd502e23.jpg",
    video:
      "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/bucket/3c9e5caa-f18d-4cef-928b-c475a05a45c0.mp4",
  },
];

export function tutorFor(seed: number): TutorMedia {
  return TUTORS[Math.abs(seed) % TUTORS.length];
}
