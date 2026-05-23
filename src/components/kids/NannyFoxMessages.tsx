import { RefObject } from "react";
import Icon from "@/components/ui/icon";
import { Message } from "@/components/kids/nannyFoxUtils";

interface Props {
  scrollRef: RefObject<HTMLDivElement>;
  messages: Message[];
  loading: boolean;
  playingIdx: number | null;
  suggested: string[];
  onPlay: (text: string, idx: number) => void;
  onStopAudio: () => void;
  onSendSuggestion: (text: string) => void;
}

export default function NannyFoxMessages({
  scrollRef,
  messages,
  loading,
  playingIdx,
  suggested,
  onPlay,
  onStopAudio,
  onSendSuggestion,
}: Props) {
  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide"
    >
      {messages.map((m, i) => {
        const isUser = m.role === "user";
        const isPlaying = playingIdx === i;
        return (
          <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
              <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                isUser
                  ? "bg-gradient-to-br from-purple-500 to-cyan-500 text-white"
                  : "bg-white/8 border border-white/10 text-white/90"
              }`}>
                {m.content}
              </div>
              {!isUser && (
                <>
                  {/* Бейдж «искала в интернете» */}
                  {m.usedSearch && (
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 px-2 py-0.5 rounded-md">
                      <Icon name="Globe" size={10} />
                      Искала в интернете
                    </div>
                  )}
                  {/* Источники */}
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {m.sources.slice(0, 4).map((src, sidx) => {
                        let host = "";
                        try { host = new URL(src.url).hostname.replace("www.", ""); } catch { host = ""; }
                        return (
                          <a
                            key={sidx}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={src.title}
                            className="inline-flex items-center gap-1 text-[10px] text-cyan-200 bg-cyan-500/8 hover:bg-cyan-500/15 border border-cyan-500/20 hover:border-cyan-500/40 px-2 py-0.5 rounded-md transition-colors"
                          >
                            <Icon name="ExternalLink" size={10} />
                            {host || `Источник ${sidx + 1}`}
                          </a>
                        );
                      })}
                    </div>
                  )}
                  <button
                    onClick={() => isPlaying ? onStopAudio() : onPlay(m.content, i)}
                    className={`mt-1.5 inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg transition-colors ${
                      isPlaying
                        ? "bg-pink-500/20 text-pink-200"
                        : "text-white/45 hover:text-pink-200 hover:bg-pink-500/10"
                    }`}
                  >
                    <Icon name={isPlaying ? "PauseCircle" : "PlayCircle"} size={12} />
                    {isPlaying ? "Остановить" : "Озвучить"}
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
      {loading && (
        <div className="flex justify-start">
          <div className="bg-white/8 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-300 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 rounded-full bg-pink-300 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 rounded-full bg-pink-300 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      )}

      {/* Подсказки — показываем, пока 1 сообщение (приветствие) */}
      {messages.length === 1 && !loading && (
        <div className="space-y-2 pt-2">
          <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold px-1">Попробуйте спросить:</p>
          {suggested.map((s) => (
            <button
              key={s}
              onClick={() => onSendSuggestion(s)}
              className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/35 rounded-2xl px-3.5 py-2.5 text-white/85 text-sm transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}