import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import HomeworkBox from "@/components/intensive/HomeworkBox";
import QuizRun, { QuizItem } from "./QuizRun";
import { SpyDay } from "./data";
import {
  LangProgress, Word, cachedDayWords, cardId, dueIds, getDayWords, review, shuffle, speak,
} from "./progress";

type Stage = "brief" | "cards" | "review" | "test" | "result" | "mission";

interface Props {
  day: SpyDay;
  lang: string;
  langName: string;
  token?: string;
  progress: LangProgress;
  onProgress: (update: (p: LangProgress) => LangProgress) => void;
  onNextDay: () => void;
}

const PASS = 80;

/** Слова из уже пройденных дней, сохранённые на устройстве. */
function learnedPool(lang: string, upTo: number): QuizItem[] {
  const items: QuizItem[] = [];
  for (let d = 1; d <= Math.min(upTo, 28); d++) {
    (cachedDayWords(lang, d) || []).forEach((w, i) => items.push({ id: cardId(d, i), word: w }));
  }
  return items;
}

export default function DayLesson({ day, lang, langName, token, progress, onProgress, onNextDay }: Props) {
  const [stage, setStage] = useState<Stage>("brief");
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [result, setResult] = useState<{ correct: number; total: number } | null>(null);
  const [reviewItems, setReviewItems] = useState<QuizItem[]>([]);
  const [testItems, setTestItems] = useState<QuizItem[]>([]);
  const [pool, setPool] = useState<Word[]>([]);

  const isStudyDay = day.chunks > 0;
  const passed = progress.passed.includes(day.day);

  useEffect(() => {
    setStage("brief");
    setWords([]);
    setError(null);
    setCardIdx(0);
    setFlipped(false);
    setResult(null);
  }, [day.day, lang]);

  const start = async () => {
    setError(null);
    if (!isStudyDay) {
      const all = learnedPool(lang, 28);
      if (all.length < 40) {
        setError("Для этого дня нужны слова прошлых дней на этом устройстве. Пройдите дни 1–28 на нём или откройте их ещё раз — слова подтянутся.");
        return;
      }
      setPool(all.map((x) => x.word));
      if (day.day === 29) {
        const weak = all.filter((x) => (progress.cards[x.id]?.box ?? 0) <= 2);
        setTestItems(shuffle(weak.length >= 20 ? weak : all).slice(0, 30));
      } else {
        setTestItems(shuffle(all).slice(0, 40));
      }
      setStage("test");
      return;
    }
    setLoading(true);
    try {
      const list = await getDayWords(lang, day.day, day.chunks, token);
      setWords(list);
      setCardIdx(0);
      setFlipped(false);
      setStage("cards");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  const dayItems = useMemo(() => words.map((w, i) => ({ id: cardId(day.day, i), word: w })), [words, day.day]);

  const afterCards = () => {
    const now = Date.now();
    const due = new Set(dueIds(progress, now));
    const prev = learnedPool(lang, day.day - 1).filter((x) => due.has(x.id));
    const all = [...learnedPool(lang, day.day - 1).map((x) => x.word), ...words];
    setPool(all);
    if (prev.length) {
      setReviewItems(shuffle(prev).slice(0, 24));
      setStage("review");
    } else {
      startTest(all);
    }
  };

  const startTest = (all?: Word[]) => {
    if (all) setPool(all);
    setTestItems(shuffle(dayItems).slice(0, 20));
    setStage("test");
  };

  const answer = (id: string, ok: boolean) => onProgress((p) => review(p, id, ok, Date.now()));

  const finishTest = (correct: number, total: number) => {
    setResult({ correct, total });
    const percent = Math.round((correct / total) * 100);
    if (percent >= PASS) {
      onProgress((p) =>
        p.passed.includes(day.day) ? p : { ...p, passed: [...p.passed, day.day].sort((a, b) => a - b) },
      );
    }
    setStage("result");
  };

  const word = words[cardIdx];
  const percent = result ? Math.round((result.correct / result.total) * 100) : 0;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 md:p-7">
      <div className="flex items-center gap-2 text-amber-300/80 text-xs font-bold uppercase tracking-widest mb-1">
        <Icon name="FolderLock" size={14} />
        Задание дня {day.day} · {langName}
        {passed && <span className="ml-2 text-emerald-300 normal-case tracking-normal">· зачёт сдан</span>}
      </div>
      <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-4">{day.title}</h3>

      {stage === "brief" && (
        <div>
          <p className="text-white/75 mb-4">{day.brief}</p>
          <ol className="space-y-2 mb-6 text-sm text-white/70">
            {isStudyDay ? (
              <>
                <li className="flex gap-2"><span className="text-amber-300 font-bold">1.</span> Изучите 36 карточек: слово, произношение, пример. Нажмите на карточку, чтобы перевернуть.</li>
                <li className="flex gap-2"><span className="text-amber-300 font-bold">2.</span> Повторите слова прошлых дней, которым пришёл срок.</li>
                <li className="flex gap-2"><span className="text-amber-300 font-bold">3.</span> Сдайте зачёт: 20 вопросов, порог {PASS}%. Без зачёта следующий день не откроется.</li>
                <li className="flex gap-2"><span className="text-amber-300 font-bold">4.</span> Выполните задание «под легендой» — ИИ-инструктор проверит.</li>
              </>
            ) : (
              <li className="flex gap-2"><span className="text-amber-300 font-bold">•</span> {day.day === 29 ? "30 вопросов по словам, которые вы знаете хуже всего." : `40 случайных слов из всего ядра. Порог сдачи — ${PASS}%.`}</li>
            )}
          </ol>
          {error && <p className="text-rose-300 text-sm mb-4">{error}</p>}
          <button
            onClick={start}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-black px-6 py-3 rounded-xl disabled:opacity-60"
          >
            {loading ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name="Play" size={18} />}
            {loading ? "Готовим слова… до 30 секунд" : isStudyDay ? "Начать задание" : day.day === 29 ? "Начать повторение" : "Начать экзамен"}
          </button>
        </div>
      )}

      {stage === "cards" && word && (
        <div>
          <div className="flex items-center justify-between text-xs text-white/50 mb-3">
            <span>Карточка {cardIdx + 1} из {words.length}</span>
            <button onClick={afterCards} className="text-amber-300 hover:text-amber-200 font-bold">Пропустить к зачёту</button>
          </div>
          <button
            onClick={() => { setFlipped(!flipped); if (!flipped) speak(word.w, lang); }}
            className="w-full min-h-[220px] rounded-2xl border border-amber-400/25 bg-gradient-to-br from-slate-900 to-slate-800 p-6 flex flex-col items-center justify-center text-center"
          >
            {!flipped ? (
              <>
                <p className="text-white/40 text-xs mb-2">Вспомните перевод и нажмите</p>
                <p className="font-montserrat font-black text-3xl text-white">{word.ru}</p>
              </>
            ) : (
              <>
                <p className="font-montserrat font-black text-3xl text-amber-200 mb-1">{word.w}</p>
                {word.tr && <p className="text-white/55 text-sm mb-4">[{word.tr}]</p>}
                {word.ex && <p className="text-white text-base">{word.ex}</p>}
                {word.exr && <p className="text-white/50 text-sm">{word.exr}</p>}
              </>
            )}
          </button>
          <div className="flex items-center justify-between mt-4 gap-3">
            <button
              onClick={() => { setCardIdx(Math.max(0, cardIdx - 1)); setFlipped(false); }}
              disabled={cardIdx === 0}
              className="inline-flex items-center gap-1 text-white/60 hover:text-white disabled:opacity-30 text-sm"
            >
              <Icon name="ArrowLeft" size={16} /> Назад
            </button>
            <button onClick={() => speak(word.w, lang)} className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm">
              <Icon name="Volume2" size={16} /> Озвучить
            </button>
            {cardIdx + 1 < words.length ? (
              <button
                onClick={() => { setCardIdx(cardIdx + 1); setFlipped(false); }}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-bold px-5 py-2.5 rounded-xl"
              >
                Дальше <Icon name="ArrowRight" size={16} />
              </button>
            ) : (
              <button onClick={afterCards} className="inline-flex items-center gap-2 bg-amber-400 text-slate-900 font-bold px-5 py-2.5 rounded-xl">
                К повторению <Icon name="ArrowRight" size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {stage === "review" && (
        <QuizRun
          key="review"
          items={reviewItems}
          pool={pool}
          lang={lang}
          title="Повторение прошлых дней"
          onAnswer={answer}
          onFinish={() => startTest()}
        />
      )}

      {stage === "test" && (
        <QuizRun
          key="test"
          items={testItems}
          pool={pool.length >= 4 ? pool : words}
          lang={lang}
          title={day.day === 30 ? "Итоговый экзамен" : day.day === 29 ? "Большое повторение" : "Зачёт дня"}
          passPercent={PASS}
          onAnswer={answer}
          onFinish={finishTest}
        />
      )}

      {stage === "result" && result && (
        <div className="text-center py-4">
          <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3 ${percent >= PASS ? "bg-emerald-500/20" : "bg-rose-500/20"}`}>
            <Icon name={percent >= PASS ? "BadgeCheck" : "RotateCcw"} size={30} className={percent >= PASS ? "text-emerald-300" : "text-rose-300"} />
          </div>
          <p className="font-montserrat font-black text-2xl text-white mb-1">
            {percent >= PASS ? "Зачёт сдан" : "Зачёт не сдан"}: {result.correct} из {result.total} ({percent}%)
          </p>
          <p className="text-white/60 text-sm mb-5">
            {percent >= PASS
              ? day.day === 30 ? "Ядро из 1000 слов освоено. Отличная работа!" : "Следующий день открыт. Осталось задание «под легендой»."
              : `Нужно ${PASS}%. Пролистайте карточки ещё раз и пересдайте — ошибки уже ушли на повторение.`}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {percent >= PASS ? (
              <button onClick={() => setStage("mission")} className="inline-flex items-center gap-2 bg-amber-400 text-slate-900 font-bold px-5 py-2.5 rounded-xl">
                <Icon name="FileSignature" size={16} /> К заданию
              </button>
            ) : (
              <button
                onClick={() => (isStudyDay ? (setCardIdx(0), setFlipped(false), setStage("cards")) : start())}
                className="inline-flex items-center gap-2 bg-amber-400 text-slate-900 font-bold px-5 py-2.5 rounded-xl"
              >
                <Icon name="RotateCcw" size={16} /> Пересдать
              </button>
            )}
          </div>
        </div>
      )}

      {stage === "mission" && (
        <div>
          <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-4 mb-4">
            <p className="text-amber-200 text-xs font-bold uppercase tracking-wide mb-1">Задание «под легендой»</p>
            <p className="text-white/85 text-sm">{day.mission} Пишите на языке изучения, используйте слова дня.</p>
          </div>
          <HomeworkBox
            lessonKey={`lang_${lang}_d${day.day}`}
            task="Отправьте текст — ИИ-инструктор исправит ошибки и объяснит их по-русски."
            placeholder="Напишите 5–7 предложений на изучаемом языке…"
          />
          {day.day < 30 && (
            <button onClick={onNextDay} className="mt-5 inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 font-bold text-sm">
              Следующий день <Icon name="ArrowRight" size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
