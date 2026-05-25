import Icon from "@/components/ui/icon";
import { Scene } from "@/components/kids/interactiveData";

interface Props {
  scene: Scene;
  sceneIdx: number;
  selected: number | null;
  verdict: "idle" | "correct" | "wrong";
  sortPlaced: Record<number, string>;
  songStepIdx: number;
  onReplayVoice: () => void;
  onChoose: (i: number) => void;
  onSortPlace: (itemIdx: number, bucketId: string) => void;
  onSongAdvance: () => void;
  onNextScene: () => void;
}

/** Рендерит тело сцены: реплика Лисы, интерактивные блоки, кнопки управления. */
export default function SceneRenderer({
  scene,
  sceneIdx,
  selected,
  verdict,
  sortPlaced,
  songStepIdx,
  onReplayVoice,
  onChoose,
  onSortPlace,
  onSongAdvance,
  onNextScene,
}: Props) {
  // Универсальная проверка — есть ли интерактив в сцене
  const hasInteraction =
    (scene.kind === "song" && scene.songSteps && scene.songSteps.length > 0) ||
    (scene.kind === "sort" && scene.options && scene.buckets) ||
    ((scene.kind === "choose" || scene.kind === "emotion" || scene.kind === "counting") &&
      scene.options && scene.options.length > 0);

  return (
    <div className="p-5 md:p-6">
      {scene.title && (
        <h3 className="font-montserrat font-black text-white text-xl md:text-2xl text-center mb-4 leading-tight">
          {scene.title}
        </h3>
      )}

      {/* Большое эмодзи или текст */}
      {scene.bigText && (
        <div className="text-center mb-5">
          <div className="font-montserrat font-black text-white text-5xl md:text-7xl mb-2 leading-none">
            {scene.bigText}
          </div>
          {scene.emoji && <div className="text-5xl">{scene.emoji}</div>}
        </div>
      )}
      {!scene.bigText && scene.emoji && (scene.kind === "intro" || scene.kind === "flashcard" || scene.kind === "song" || scene.kind === "emotion" || scene.kind === "counting" || scene.kind === "letter") && (
        <div className="text-center mb-5">
          <div className="text-7xl md:text-8xl mb-3">{scene.emoji}</div>
        </div>
      )}

      {/* Реплика Лисы */}
      <div className="bg-pink-500/10 border border-pink-500/25 rounded-2xl p-4 mb-5 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-xl flex-shrink-0">
          🦊
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white text-sm leading-relaxed">{scene.voice}</p>
        </div>
        <button
          onClick={onReplayVoice}
          title="Послушать ещё раз"
          className="p-1.5 rounded-lg text-pink-300 hover:text-white hover:bg-pink-500/20 transition-colors flex-shrink-0"
        >
          <Icon name="RotateCcw" size={14} />
        </button>
      </div>

      {/* Песенка */}
      {scene.kind === "song" && scene.songSteps && (
        <div className="space-y-2 mb-5">
          {scene.songSteps.map((step, i) => (
            <div
              key={i}
              className={`rounded-xl px-4 py-2.5 text-center transition-all ${
                i === songStepIdx
                  ? "bg-gradient-to-r from-pink-500/25 to-rose-500/25 border-2 border-pink-500/45 text-white font-semibold scale-105"
                  : i < songStepIdx
                  ? "bg-white/5 border border-white/10 text-white/45"
                  : "bg-white/5 border border-white/10 text-white/65"
              }`}
            >
              {step}
            </div>
          ))}
          <button
            onClick={onSongAdvance}
            className="w-full mt-3 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-bold px-5 py-3 rounded-2xl hover:scale-[1.01] transition-transform"
          >
            {songStepIdx + 1 >= scene.songSteps.length ? "Готово!" : "Следующая строчка"}
            <Icon name="ArrowRight" size={14} />
          </button>
        </div>
      )}

      {/* Варианты выбора (choose / emotion / counting / letter с выбором) */}
      {(scene.kind === "choose" || scene.kind === "emotion" || scene.kind === "counting" || scene.kind === "letter") && scene.options && (
        <div className={`grid gap-2.5 ${scene.options.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
          {scene.options.map((opt, i) => {
            const isSelected = selected === i;
            const showVerdict = isSelected && verdict !== "idle";
            return (
              <button
                key={i}
                onClick={() => onChoose(i)}
                disabled={verdict === "correct"}
                className={`group relative bg-white/5 hover:bg-white/10 border-2 rounded-2xl p-4 transition-all ${
                  showVerdict && verdict === "correct"
                    ? "border-emerald-500/70 bg-emerald-500/20 scale-105"
                    : showVerdict && verdict === "wrong"
                    ? "border-rose-500/70 bg-rose-500/15"
                    : "border-white/10 hover:border-pink-500/40 hover:scale-105"
                }`}
              >
                <div className="text-5xl md:text-6xl mb-2">{opt.emoji}</div>
                <p className="text-white/85 text-xs md:text-sm font-semibold">{opt.label}</p>
                {showVerdict && verdict === "correct" && (
                  <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Icon name="Check" size={14} className="text-white" />
                  </div>
                )}
                {showVerdict && verdict === "wrong" && (
                  <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center">
                    <Icon name="X" size={14} className="text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Сортировка */}
      {scene.kind === "sort" && scene.buckets && scene.options && (
        <div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {scene.buckets.map((bucket) => {
              const placedItems = scene.options!
                .map((o, idx) => ({ o, idx }))
                .filter(({ idx }) => sortPlaced[idx] === bucket.id);
              return (
                <div
                  key={bucket.id}
                  className="bg-white/5 border-2 border-dashed border-white/20 rounded-2xl p-3 min-h-[120px]"
                >
                  <p className="text-white text-xs font-bold text-center mb-2 inline-flex items-center justify-center gap-1 w-full">
                    <span className="text-base">{bucket.emoji}</span>
                    {bucket.label}
                  </p>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {placedItems.map(({ o, idx }) => (
                      <span key={idx} className="text-3xl">{o.emoji}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-white/45 text-[11px] text-center mb-3">Нажми на предмет, потом — на нужную корзинку</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {scene.options.map((opt, i) => {
              const placed = sortPlaced[i];
              if (placed) return null;
              return (
                <div key={i} className="bg-white/5 border border-white/15 rounded-2xl p-3 text-center">
                  <div className="text-4xl mb-1">{opt.emoji}</div>
                  <p className="text-white/65 text-[10px] mb-2 truncate">{opt.label}</p>
                  <div className="flex gap-1 justify-center">
                    {scene.buckets!.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => onSortPlace(i, b.id)}
                        className="text-lg p-1 rounded-lg bg-white/5 hover:bg-pink-500/25 transition-colors"
                        title={`В ${b.label}`}
                      >
                        {b.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {verdict === "correct" && (
            <p className="mt-3 text-center text-emerald-300 font-bold animate-pulse">✅ Всё верно!</p>
          )}
          {verdict === "wrong" && (
            <p className="mt-3 text-center text-rose-300 font-bold">Не совсем — попробуем ещё раз</p>
          )}
        </div>
      )}

      {/* Кнопка «Дальше» — показываем для всех сцен БЕЗ интерактива.
          То есть когда нет options (выбор/сортировка) и нет songSteps (песенка).
          Сценам с выбором кнопка не нужна — там автопереход после правильного ответа. */}
      {!hasInteraction && (() => {
        const label =
          scene.kind === "finish"
            ? "Завершить"
            : sceneIdx === 0
            ? "Начнём!"
            : scene.kind === "letter"
            ? "Дальше"
            : scene.kind === "flashcard"
            ? "Дальше"
            : "Дальше";
        return (
          <button
            onClick={onNextScene}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-base font-bold px-6 py-3.5 rounded-2xl hover:scale-[1.01] transition-transform shadow-lg shadow-pink-500/30"
          >
            {label}
            <Icon name="ArrowRight" size={16} />
          </button>
        );
      })()}

      {/* Кнопка-фолбэк «Пропустить» для сцен с интерактивом — если ребёнок не справляется */}
      {hasInteraction && (
        <button
          onClick={onNextScene}
          className="w-full mt-4 inline-flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/55 hover:text-white/85 text-xs font-medium py-2.5 rounded-xl transition-colors"
        >
          <Icon name="SkipForward" size={12} />
          Пропустить шаг
        </button>
      )}

      {/* Подсказка для родителя */}
      {scene.hintForParent && (
        <div className="mt-4 bg-amber-500/8 border border-amber-500/25 rounded-xl p-3 flex items-start gap-2">
          <Icon name="Lightbulb" size={13} className="text-amber-300 flex-shrink-0 mt-0.5" />
          <p className="text-amber-200/90 text-[11px] leading-relaxed"><b>Совет родителю:</b> {scene.hintForParent}</p>
        </div>
      )}
    </div>
  );
}
