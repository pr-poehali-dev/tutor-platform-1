import { useEffect, useRef, useState } from "react";
import { FaceMap, Persona } from "./personaTypes";

interface Props {
  persona: Persona;
  /** Громкость речи 0..1 — управляет открытием рта. */
  level: number;
  /** Персона сейчас говорит. */
  speaking: boolean;
  /** Персона думает над ответом. */
  thinking?: boolean;
  /** Персона слушает пользователя. */
  listening?: boolean;
  className?: string;
  /** Показать сетку разметки (режим настройки в студии). */
  debug?: boolean;
}

/**
 * Живое лицо персоны поверх обычного фото.
 *
 * Идея: фотореалистичный портрет остаётся фоном, а сверху рисуются только
 * подвижные части — губы и веки. Мозг воспринимает совпадение движения губ
 * со звуком как живую речь, даже если само фото статично.
 *
 * Что делает лицо живым (в порядке важности):
 *  1. Губы открываются ровно под громкость голоса — липсинк.
 *  2. Моргание через случайные 2.5–6 секунд — без него лицо «мёртвое».
 *  3. Дыхание: едва заметное покачивание и наплыв кадра.
 *  4. Микродвижения головы, пока персона говорит.
 *
 * Всё считается в браузере, без внешних сервисов и абонплаты.
 */
export default function PersonaFace({
  persona,
  level,
  speaking,
  thinking = false,
  listening = false,
  className = "",
  debug = false,
}: Props) {
  const f: FaceMap = persona.face;
  const [blink, setBlink] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Моргание: случайный интервал выглядит естественнее строгого ритма.
  useEffect(() => {
    let alive = true;
    const schedule = () => {
      const delay = 2500 + Math.random() * 3500;
      timerRef.current = window.setTimeout(() => {
        if (!alive) return;
        setBlink(true);
        window.setTimeout(() => {
          if (!alive) return;
          setBlink(false);
          // Иногда человек моргает дважды подряд — добавляем такую деталь.
          if (Math.random() < 0.22) {
            window.setTimeout(() => {
              if (!alive) return;
              setBlink(true);
              window.setTimeout(() => alive && setBlink(false), 110);
            }, 180);
          }
          schedule();
        }, 115);
      }, delay);
    };
    schedule();
    return () => {
      alive = false;
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  // Открытие рта: держим небольшой минимум, чтобы губы не «залипали».
  const open = speaking ? Math.max(0.06, Math.min(1, level)) : 0;
  const mouthH = open * (f.mouthW * 0.62); // высота проёма пропорциональна ширине рта
  const mouthWNow = f.mouthW * (0.82 + open * 0.18); // на громких слогах рот шире

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        // Дыхание и лёгкий наплыв, пока персона говорит.
        animation: speaking
          ? "persona-talk 3.2s ease-in-out infinite"
          : "persona-breathe 5.5s ease-in-out infinite",
      }}
    >
      <img
        src={persona.image}
        alt={persona.fullName}
        className="w-full h-full object-cover select-none"
        draggable={false}
        style={{
          filter: thinking
            ? "saturate(0.92) brightness(0.97)"
            : speaking
              ? "saturate(1.06) brightness(1.02)"
              : "none",
          transition: "filter 400ms ease",
        }}
      />

      {/* ГУБЫ. Тёмный проём рта с подсветкой нижней губы —
          при малом открытии почти незаметен, при большом читается как речь. */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${f.mouthX}%`,
          top: `${f.mouthY}%`,
          width: `${mouthWNow}%`,
          height: `${Math.max(0.4, mouthH)}%`,
          transform: "translate(-50%, -50%)",
          borderRadius: "50% / 50%",
          background:
            "radial-gradient(ellipse at 50% 35%, rgba(58,18,26,0.94) 0%, rgba(38,10,16,0.9) 55%, rgba(28,8,12,0.72) 100%)",
          boxShadow: `0 ${Math.max(0.5, open * 1.6)}px ${1 + open * 3}px rgba(255,180,180,0.16), inset 0 -1px 2px rgba(0,0,0,0.45)`,
          opacity: speaking ? Math.min(1, 0.25 + open * 1.5) : 0,
          transition: "opacity 90ms linear",
          filter: `blur(${Math.max(0.6, 1.7 - open)}px)`,
        }}
      />

      {/* ВЕКИ. Прямоугольник цвета кожи опускается сверху на глаз.
          Цвет усреднённый — на портретах в тёмной гамме шов не виден. */}
      {[f.eyeLeftX, f.eyeRightX].map((x, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: `${x}%`,
            top: `${f.eyesY}%`,
            width: `${f.eyeW}%`,
            height: `${f.eyeH}%`,
            transform: "translate(-50%, -50%)",
            borderRadius: "44% 44% 50% 50%",
            background:
              "linear-gradient(180deg, rgba(196,150,124,0.97) 0%, rgba(170,124,100,0.95) 62%, rgba(140,98,78,0.9) 100%)",
            transformOrigin: "top center",
            scale: blink ? "1 1" : "1 0.02",
            opacity: blink ? 1 : 0,
            transition: "scale 95ms ease-out, opacity 70ms ease-out",
            filter: "blur(0.7px)",
          }}
        />
      ))}

      {/* Состояние «думает» — мягкое затемнение и точки. */}
      {thinking && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 pb-3 bg-gradient-to-t from-black/55 to-transparent pt-8">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white/85"
              style={{ animation: `persona-dot 1.1s ease-in-out ${i * 0.18}s infinite` }}
            />
          ))}
        </div>
      )}

      {/* Состояние «слушает» — пульсирующая рамка. */}
      {listening && (
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit]"
          style={{
            boxShadow: `inset 0 0 0 3px ${persona.accent}`,
            animation: "persona-listen 1.4s ease-in-out infinite",
          }}
        />
      )}

      {/* Сетка настройки — только в студии. */}
      {debug && (
        <>
          {[f.eyeLeftX, f.eyeRightX].map((x, i) => (
            <div
              key={i}
              className="absolute border border-cyan-400 pointer-events-none"
              style={{
                left: `${x}%`,
                top: `${f.eyesY}%`,
                width: `${f.eyeW}%`,
                height: `${f.eyeH}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
          <div
            className="absolute border border-pink-400 pointer-events-none"
            style={{
              left: `${f.mouthX}%`,
              top: `${f.mouthY}%`,
              width: `${f.mouthW}%`,
              height: `${f.mouthW * 0.5}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        </>
      )}
    </div>
  );
}
