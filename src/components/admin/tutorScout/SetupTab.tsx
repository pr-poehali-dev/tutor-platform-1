import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";

interface Props {
  connected: Record<string, boolean>;
}

const BLOCKS = [
  {
    key: "vk",
    title: "ВКонтакте — люди, сообщества, объявления",
    steps: [
      "Зайдите на vkhost.github.io (официальные приложения VK) и выберите «VK Admin» или «Kate Mobile».",
      "Разрешите доступ — откроется адрес со словом access_token=...",
      "Скопируйте всё между access_token= и &expires_in — это ключ.",
      "Вставьте его в секрет VK_ACCESS_TOKEN (Ядро → Секреты).",
    ],
    note: "Ключ выдаётся от вашего личного аккаунта VK. Поиск идёт только по открытым данным, писать людям система сама не будет.",
  },
  {
    key: "yandex",
    title: "Интернет и каналы MAX/Telegram — через Яндекс Поиск",
    steps: [
      "Откройте console.yandex.cloud — там уже есть ваш каталог (YANDEX_FOLDER_ID подключён).",
      "Сервисные аккаунты → создать → роль search-api.webSearch.user.",
      "В аккаунте: «Создать новый ключ» → «API-ключ» → скопируйте ключ.",
      "Вставьте его в секрет YANDEX_SEARCH_API_KEY.",
    ],
    note: "Около 1 ₽ за запрос (50 результатов). В месяц на поиск партнёров обычно уходит 100–300 ₽.",
  },
  {
    key: "ai",
    title: "ИИ-черновики предложений",
    steps: ["Уже подключено через ключ polza.ai."],
    note: "Если ключа нет — система подставит готовый шаблон письма.",
  },
  {
    key: "max",
    title: "Бот MAX — заявки и ответы репетиторов",
    steps: ["Уже подключено. Все, кто оставил заявку в боте, сами попадают в базу как «Ответил»."],
    note: "Таким репетиторам можно писать прямо отсюда кнопкой «Отправить в MAX».",
  },
];

export default function SetupTab({ connected }: Props) {
  return (
    <div className="space-y-3">
      {BLOCKS.map((b) => (
        <Card key={b.key} className="border-white/10 bg-white/[0.04] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Icon
              name={connected[b.key] ? "CircleCheck" : "CircleDashed"}
              size={18}
              className={connected[b.key] ? "text-emerald-400" : "text-amber-300"}
            />
            <p className="font-semibold text-white">{b.title}</p>
            <span className={`ml-auto text-xs ${connected[b.key] ? "text-emerald-300" : "text-amber-300"}`}>
              {connected[b.key] ? "подключено" : "не подключено"}
            </span>
          </div>
          {!connected[b.key] && (
            <ol className="ml-5 list-decimal space-y-1 text-sm text-white/70">
              {b.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          )}
          <p className="mt-2 text-xs text-white/45">{b.note}</p>
        </Card>
      ))}

      <Card className="border-white/10 bg-white/[0.04] p-4 text-sm text-white/70">
        <p className="mb-1 font-semibold text-white">Правила, чтобы не попасть в спам</p>
        <ul className="ml-5 list-disc space-y-1">
          <li>Не больше 20–30 первых сообщений в день с одного аккаунта VK.</li>
          <li>Каждый текст — личный: ИИ упоминает предмет и детали из анкеты.</li>
          <li>Если человек не ответил — одно напоминание через 3 дня, потом «Отказ».</li>
          <li>В каналах MAX/Telegram сначала спросите разрешения у администратора на пост.</li>
        </ul>
      </Card>
    </div>
  );
}
