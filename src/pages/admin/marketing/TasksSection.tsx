import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MktTask, PRIORITY_COLOR, STATUS_COLOR, STATUS_LABEL } from "./types";

interface Props {
  tasks: MktTask[];
  onCreate: (title: string, description: string, priority: "high" | "medium" | "low") => void;
  onUpdateStatus: (id: number, status: string) => void;
}

export default function TasksSection({ tasks, onCreate, onUpdateStatus }: Props) {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState<"high" | "medium" | "low">("medium");

  const createTask = () => {
    if (!taskTitle.trim()) return;
    onCreate(taskTitle.trim(), taskDescription.trim(), taskPriority);
    setTaskTitle(""); setTaskDescription(""); setTaskPriority("medium");
    setShowTaskForm(false);
  };

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h2 className="font-montserrat text-lg font-bold text-white/85 flex items-center gap-2">
          <Icon name="ClipboardList" size={18} className="text-cyan-300" />
          Задачи отделу продаж
          <span className="text-white/40 text-sm font-normal ml-2">{tasks.length}</span>
        </h2>
        <Button onClick={() => setShowTaskForm(!showTaskForm)} className="bg-gradient-to-r from-purple-500 to-cyan-500">
          <Icon name="Plus" size={14} className="mr-1.5" />
          Новая задача
        </Button>
      </div>

      {showTaskForm && (
        <Card className="border border-purple-400/30 bg-purple-500/[0.04] p-4 mb-4">
          <div className="space-y-3">
            <Input
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Заголовок задачи (например, «Прозвонить 30 горячих лидов»)"
              className="bg-white/[0.04] border-white/12"
            />
            <Textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Описание: что сделать, какой сегмент, какой скрипт..."
              className="bg-white/[0.04] border-white/12 min-h-[80px]"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {(["high", "medium", "low"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setTaskPriority(p)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      taskPriority === p ? PRIORITY_COLOR[p] : "border-white/10 text-white/45"
                    }`}
                  >
                    {p === "high" ? "Срочно" : p === "medium" ? "Обычная" : "Низкий"}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowTaskForm(false)}>Отмена</Button>
                <Button size="sm" onClick={createTask} disabled={!taskTitle.trim()} className="bg-gradient-to-r from-purple-500 to-cyan-500">
                  <Icon name="Send" size={12} className="mr-1" /> Отправить продажам
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {tasks.length === 0 ? (
        <Card className="border border-white/10 bg-white/[0.02] p-10 text-center text-white/40">
          Задач пока нет. Создай первую или передай идею из «Идей роста».
        </Card>
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => (
            <Card key={t.id} className="border border-white/10 bg-white/[0.03] p-3.5 hover:bg-white/[0.05] transition-all">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant="outline" className={`text-[10px] ${PRIORITY_COLOR[t.priority]}`}>
                      {t.priority === "high" ? "Срочно" : t.priority === "medium" ? "Обычная" : "Низкий"}
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] ${STATUS_COLOR[t.status]}`}>
                      {STATUS_LABEL[t.status]}
                    </Badge>
                    <span className="text-white/40 text-xs">→ {t.assigned_to === "sales" ? "Продажам" : t.assigned_to}</span>
                  </div>
                  <div className="font-semibold text-white text-sm">{t.title}</div>
                  {t.description && <div className="text-white/55 text-xs mt-1 leading-snug">{t.description}</div>}
                  <div className="text-white/35 text-xs mt-1">{new Date(t.created_at).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })}</div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {t.status !== "done" && (
                    <Button size="sm" variant="ghost" onClick={() => onUpdateStatus(t.id, "done")} className="text-emerald-300 hover:bg-emerald-500/10 h-8">
                      <Icon name="CheckCircle" size={14} />
                    </Button>
                  )}
                  {t.status === "todo" && (
                    <Button size="sm" variant="ghost" onClick={() => onUpdateStatus(t.id, "in_progress")} className="text-cyan-300 hover:bg-cyan-500/10 h-8">
                      <Icon name="Play" size={14} />
                    </Button>
                  )}
                  {t.status !== "cancelled" && t.status !== "done" && (
                    <Button size="sm" variant="ghost" onClick={() => onUpdateStatus(t.id, "cancelled")} className="text-white/40 hover:bg-white/5 h-8">
                      <Icon name="X" size={14} />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
