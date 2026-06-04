import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Icon from "@/components/ui/icon";
import SiteFooter from "@/components/SiteFooter";
import OlympiadGame from "@/components/olympiad/OlympiadGame";
import OlympiadLeaderboard from "@/components/olympiad/OlympiadLeaderboard";

type View = "game" | "leaderboard";

export default function Olympiad() {
  const [view, setView] = useState<View>("game");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Мини-олимпиада — УЧИСЬПРО</title>
        <meta name="description" content="Школьная мини-олимпиада с призами ЗНАЙКИ. Реши задачи без ошибок и забери главный приз 5000 ЗНАЕК. Личный ИИ-тренер мотивирует и даёт советы." />
      </Helmet>

      <header className="px-4 py-4 border-b border-white/10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-white/70 hover:text-white flex items-center gap-2 text-sm font-bold">
            <Icon name="ArrowLeft" size={18} /> На главную
          </Link>
          <div className="flex items-center gap-1.5 text-white font-montserrat font-black">
            <span className="text-lg">🏆</span> Олимпиада
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 md:py-12">
        {view === "game" ? (
          <OlympiadGame onLeaderboard={() => setView("leaderboard")} />
        ) : (
          <OlympiadLeaderboard onBack={() => setView("game")} />
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
