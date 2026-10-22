import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ADMIN_PIN_KEY, forgetAdminPin, savedAdminPin, verifyAdminPin } from "@/lib/adminAuth";
import { call } from "@/components/admin/tutorScout/api";
import SearchTab from "@/components/admin/tutorScout/SearchTab";
import BaseTab from "@/components/admin/tutorScout/BaseTab";
import SetupTab from "@/components/admin/tutorScout/SetupTab";

/** Поиск репетиторов-партнёров и ведение общения с ними. */
export default function TutorScout() {
  const [hasPin, setHasPin] = useState(!!savedAdminPin());
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState("");
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [tab, setTab] = useState("base");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!hasPin) return;
    call<{ sources: Record<string, boolean> }>("status").then((r) => {
      if (r.ok) setConnected(r.sources);
      else if (r.error === "Нет доступа") {
        forgetAdminPin();
        setHasPin(false);
      }
    });
  }, [hasPin]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await verifyAdminPin(pinInput);
    if (r === "ok") {
      sessionStorage.setItem(ADMIN_PIN_KEY, pinInput.trim());
      setHasPin(true);
      setError("");
    } else setError(r === "network" ? "Нет связи с сервером" : "Неверный PIN");
  };

  if (!hasPin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mesh p-6 font-golos">
        <Card className="w-full max-w-sm border-white/10 bg-white/[0.04] p-6">
          <p className="mb-3 font-bold text-white">Введите PIN администратора</p>
          <form onSubmit={login} className="flex gap-2">
            <Input type="password" value={pinInput} onChange={(e) => setPinInput(e.target.value)} placeholder="PIN" />
            <Button type="submit" className="bg-primary text-primary-foreground">Войти</Button>
          </form>
          {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh p-4 font-golos text-white md:p-8">
      <Seo title="Репетиторы-партнёры · УЧИСЬПРО" description="Поиск репетиторов и работа с партнёрами" noindex />
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="text-white/50 hover:text-white">
            <Icon name="ArrowLeft" size={20} />
          </Link>
          <div>
            <h1 className="font-montserrat text-2xl font-black md:text-3xl">Репетиторы-партнёры</h1>
            <p className="text-sm text-white/55">
              Находим репетиторов в VK, интернете и каналах, предлагаем бесплатный ИИ-помощник для занятий. Мы партнёры, не конкуренты.
            </p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-white/5">
            <TabsTrigger value="base">
              <Icon name="Users" size={14} className="mr-1.5" />
              База и общение
            </TabsTrigger>
            <TabsTrigger value="search">
              <Icon name="Search" size={14} className="mr-1.5" />
              Поиск
            </TabsTrigger>
            <TabsTrigger value="setup">
              <Icon name="Plug" size={14} className="mr-1.5" />
              Подключение
            </TabsTrigger>
          </TabsList>
          <TabsContent value="base" className="mt-4">
            <BaseTab reloadKey={reloadKey} />
          </TabsContent>
          <TabsContent value="search" className="mt-4">
            <SearchTab connected={connected} onSaved={() => setReloadKey((k) => k + 1)} />
          </TabsContent>
          <TabsContent value="setup" className="mt-4">
            <SetupTab connected={connected} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
