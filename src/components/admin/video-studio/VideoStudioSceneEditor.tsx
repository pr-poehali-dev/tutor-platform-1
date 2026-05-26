import Icon from "@/components/ui/icon";
import { VideoScene } from "@/components/video/VideoStudioPlayer";

interface Props {
  scenes: VideoScene[];
  onExportJson: () => void;
  onSaveProject: () => void;
  onUpdateScene: (idx: number, patch: Partial<VideoScene>) => void;
  onRenderOneScene: (sceneId: string) => void;
  onRemoveScene: (idx: number) => void;
}

export default function VideoStudioSceneEditor({
  scenes,
  onExportJson,
  onSaveProject,
  onUpdateScene,
  onRenderOneScene,
  onRemoveScene,
}: Props) {
  if (scenes.length === 0) return null;

  return (
    <div className="bg-card border border-white/10 rounded-3xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold">Раскадровка ({scenes.length} сцен)</p>
        <div className="flex gap-2">
          <button onClick={onExportJson} className="inline-flex items-center gap-1 text-xs text-white/75 hover:text-white bg-white/8 hover:bg-white/12 border border-white/15 px-2.5 py-1 rounded-lg">
            <Icon name="Download" size={11} />
            JSON
          </button>
          <button onClick={onSaveProject} className="inline-flex items-center gap-1 text-xs bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-200 px-2.5 py-1 rounded-lg">
            <Icon name="Save" size={11} />
            Сохранить
          </button>
        </div>
      </div>
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
        {scenes.map((s, i) => (
          <div key={s.id} className={`bg-white/[0.03] border rounded-2xl p-3 ${s.error ? "border-rose-500/40" : "border-white/10"}`}>
            <div className="flex items-start gap-3 mb-2">
              <div className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center ${s.error ? "bg-rose-500/15" : "bg-white/5"}`}>
                {s.image_url ? (
                  <img src={s.image_url} alt="" className="w-full h-full object-cover" />
                ) : s.error ? (
                  <Icon name="AlertTriangle" size={16} className="text-rose-300" />
                ) : (
                  <Icon name="ImageOff" size={16} className="text-white/30" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white/45 text-[10px] uppercase tracking-wider">Сцена {i + 1} · {s.duration_sec}с</p>
                <textarea
                  value={s.narration}
                  onChange={(e) => onUpdateScene(i, { narration: e.target.value })}
                  rows={2}
                  className="w-full bg-transparent text-white text-xs mt-0.5 resize-none focus:outline-none focus:bg-white/5 rounded p-1"
                />
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button
                  onClick={() => onRenderOneScene(s.id)}
                  title="Перегенерировать картинку"
                  className="p-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-200"
                >
                  <Icon name="RefreshCw" size={11} />
                </button>
                <button
                  onClick={() => onRemoveScene(i)}
                  title="Удалить сцену"
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-200"
                >
                  <Icon name="Trash2" size={11} />
                </button>
              </div>
            </div>
            {s.error && (
              <div className="mb-2 bg-rose-500/10 border border-rose-500/30 rounded-lg px-2 py-1.5 text-rose-200 text-[10px] flex items-start gap-1.5">
                <Icon name="AlertCircle" size={11} className="flex-shrink-0 mt-0.5" />
                <span className="break-words">{s.error}</span>
              </div>
            )}
            <details className="text-[10px] text-white/45">
              <summary className="cursor-pointer hover:text-white/70">Промпт для картинки</summary>
              <textarea
                value={s.image_prompt}
                onChange={(e) => onUpdateScene(i, { image_prompt: e.target.value })}
                rows={2}
                className="w-full mt-1 bg-background/40 border border-white/10 rounded p-1.5 text-white/75 text-[10px] font-mono resize-none focus:outline-none"
              />
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
