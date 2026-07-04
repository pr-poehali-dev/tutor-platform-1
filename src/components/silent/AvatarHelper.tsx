import { AvatarLine, SILENT_AVATAR } from "@/components/silent/silentCourseData";

interface Props {
  line: AvatarLine;
  size?: "sm" | "lg";
}

const MOOD_RING: Record<AvatarLine["mood"], string> = {
  hello: "ring-cyan-400/60",
  point: "ring-purple-400/60",
  cheer: "ring-amber-400/70",
  think: "ring-indigo-400/60",
  bye: "ring-pink-400/60",
};

/** Аватар-помощник: картинка персонажа + реплика в пузыре. Мотиватор и навигатор урока. */
export default function AvatarHelper({ line, size = "lg" }: Props) {
  const avatarSize = size === "lg" ? "w-20 h-20 md:w-24 md:h-24" : "w-14 h-14";
  return (
    <div className="flex items-start gap-3 md:gap-4">
      <div className="relative flex-shrink-0">
        <img
          src={SILENT_AVATAR}
          alt="Аватар-помощник"
          className={`${avatarSize} rounded-2xl object-cover ring-2 ${MOOD_RING[line.mood]} transition-all`}
        />
        <span className="absolute -bottom-2 -right-2 text-2xl md:text-3xl drop-shadow-lg select-none">
          {line.emoji}
        </span>
      </div>
      <div className="relative flex-1 min-w-0 bg-white/8 border border-white/12 rounded-2xl rounded-tl-sm p-4 backdrop-blur-sm">
        <span className="absolute -left-2 top-4 w-3 h-3 bg-white/8 border-l border-b border-white/12 rotate-45" />
        <p className="text-white/90 text-base md:text-lg leading-relaxed font-medium">
          {line.text}
        </p>
      </div>
    </div>
  );
}
