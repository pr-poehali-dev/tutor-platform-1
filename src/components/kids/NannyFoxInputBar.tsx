import Icon from "@/components/ui/icon";

interface Props {
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  recording: boolean;
  recognizing: boolean;
  micError: string | null;
  micSeconds: number;
  onClearMicError: () => void;
  onSend: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancelRecording: () => void;
}

export default function NannyFoxInputBar({
  input,
  setInput,
  loading,
  recording,
  recognizing,
  micError,
  micSeconds,
  onClearMicError,
  onSend,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
}: Props) {
  return (
    <>
      {/* Ошибка микрофона */}
      {micError && (
        <div className="mx-3 mb-2 bg-rose-500/12 border border-rose-500/35 rounded-2xl px-3 py-2 flex items-start gap-2 animate-fadeIn">
          <Icon name="MicOff" size={14} className="text-rose-300 flex-shrink-0 mt-0.5" />
          <p className="text-rose-200 text-xs flex-1">{micError}</p>
          <button
            onClick={onClearMicError}
            className="text-rose-300/70 hover:text-rose-200"
            aria-label="Закрыть"
          >
            <Icon name="X" size={12} />
          </button>
        </div>
      )}

      {/* Идёт распознавание */}
      {recognizing && (
        <div className="mx-3 mb-2 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl px-3 py-2 flex items-center gap-2 animate-fadeIn">
          <Icon name="Loader2" size={14} className="text-cyan-300 animate-spin" />
          <p className="text-cyan-200 text-xs">Распознаю речь...</p>
        </div>
      )}

      {/* Поле ввода или состояние записи */}
      <div className="p-3 border-t border-white/10">
        {recording ? (
          <div className="flex items-center gap-2 bg-rose-500/12 border border-rose-500/35 rounded-2xl px-4 py-2.5 animate-fadeIn">
            <span className="relative flex w-3 h-3 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
            </span>
            <p className="text-white text-sm font-semibold flex-1">
              Говорите... <span className="text-white/55 text-xs tabular-nums">{micSeconds}с / 20с</span>
            </p>
            <button
              onClick={onCancelRecording}
              title="Отменить"
              className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/15 text-white/75 rounded-xl transition-colors"
            >
              <Icon name="X" size={14} />
            </button>
            <button
              onClick={onStopRecording}
              title="Готово — отправить"
              className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-xl hover:scale-105 transition-transform"
            >
              <Icon name="Check" size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onSend(); }}
              placeholder="Напишите или нажмите 🎤"
              disabled={loading || recognizing}
              className="flex-1 bg-white/5 border border-white/12 rounded-2xl px-4 py-2.5 text-white text-sm placeholder:text-white/35 focus:outline-none focus:border-pink-500/45 focus:bg-white/8 transition-colors disabled:opacity-60"
            />
            <button
              onClick={onStartRecording}
              disabled={loading || recognizing}
              title="Сказать голосом"
              className="w-10 h-10 flex items-center justify-center bg-white/8 hover:bg-pink-500/20 border border-white/15 hover:border-pink-500/45 text-white/85 hover:text-pink-200 rounded-2xl transition-all disabled:opacity-40"
            >
              <Icon name="Mic" size={16} />
            </button>
            <button
              onClick={onSend}
              disabled={!input.trim() || loading || recognizing}
              title="Отправить"
              className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-2xl hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
            >
              <Icon name="Send" size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
