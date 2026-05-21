export const LEARNING_PATH_URL = "https://functions.poehali.dev/86110786-84ba-446a-acd9-eddaa31821b2";

export interface SubjectChoice {
  id: string;
  name: string;
  emoji: string;
  color: string;
  accent: string;
  grades: { id: string; label: string }[];
}

export const SUBJECTS: SubjectChoice[] = [
  {
    id: "math",
    name: "Математика",
    emoji: "📐",
    color: "from-purple-600 to-blue-600",
    accent: "#a855f7",
    grades: [
      { id: "5-9", label: "5–9 класс" },
      { id: "10-11", label: "10–11 класс" },
      { id: "ege", label: "ЕГЭ" },
    ],
  },
  {
    id: "physics",
    name: "Физика",
    emoji: "⚡",
    color: "from-cyan-500 to-blue-600",
    accent: "#00d4ff",
    grades: [
      { id: "5-9", label: "5–9 класс" },
      { id: "10-11", label: "10–11 класс" },
      { id: "ege", label: "ЕГЭ" },
    ],
  },
  {
    id: "english",
    name: "Английский",
    emoji: "🌍",
    color: "from-pink-500 to-rose-600",
    accent: "#f72585",
    grades: [
      { id: "5-9", label: "5–9 класс" },
      { id: "10-11", label: "10–11 класс" },
      { id: "ege", label: "ЕГЭ" },
    ],
  },
  {
    id: "russian",
    name: "Русский язык",
    emoji: "✍️",
    color: "from-rose-500 to-orange-500",
    accent: "#ff6b35",
    grades: [
      { id: "5-9", label: "5–9 класс" },
      { id: "10-11", label: "10–11 класс" },
      { id: "ege", label: "ЕГЭ" },
    ],
  },
];

export interface TestQuestion {
  id: number;
  topic: string;
  level: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface TestAnswer {
  topic: string;
  level: number;
  is_correct: boolean;
  question: string;
}

export interface AnalysisResult {
  score_percent: number;
  level_assessment: string;
  weak_topics: { topic: string; severity: string; reason: string }[];
  strong_topics: string[];
  personalized_message: string;
  follow_up_questions: string[];
}

export interface ProgramModule {
  id: number;
  topic: string;
  title: string;
  description: string;
  skills: string[];
  tasks_count: number;
  difficulty: string;
  estimated_minutes: number;
  repeat_after_days: number[];
}

export interface Program {
  program_title: string;
  estimated_days: number;
  total_modules: number;
  modules: ProgramModule[];
  tips: string[];
}

export interface Task {
  task_id: string;
  type: "multiple_choice" | "input" | "explain";
  question: string;
  context: string;
  options: string[];
  correct_answer: string | number;
  hints: string[];
  explanation: string;
  fun_fact: string;
}

export interface TheoryBlock {
  heading: string;
  content: string;
  key_points: string[];
}

export interface LessonExample {
  title: string;
  problem: string;
  solution_steps: string[];
  answer: string;
  note: string;
}

export interface Lesson {
  title: string;
  subtitle: string;
  duration_minutes: number;
  objectives: string[];
  theory_blocks: TheoryBlock[];
  examples: LessonExample[];
  common_mistakes: string[];
  summary: string;
  tasks: Task[];
}

export type JourneyStep = "subject" | "test" | "analyzing" | "results" | "program" | "lesson" | "complete";