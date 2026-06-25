import Icon from "@/components/ui/icon";
import { MaxChannel } from "./api";

interface Props {
  channels: MaxChannel[];
}

export default function MaxChannelsBlock({ channels }: Props) {
  if (!channels || channels.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-1">
        <Icon name="MessageCircle" size={18} className="text-sky-300" />
        <h2 className="font-montserrat font-black text-xl md:text-2xl text-white">
          IT-каналы в MAX
        </h2>
      </div>
      <p className="text-white/55 text-sm mb-5 max-w-2xl">
        Подборка экспертных каналов по программированию и технологиям в мессенджере MAX.
        Подпишись, чтобы быть в теме главных IT-трендов.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {channels.map((ch) => (
          <a
            key={ch.handle}
            href={ch.max_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-sky-500/30 hover:bg-white/[0.06] transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-500/10 flex items-center justify-center text-2xl flex-shrink-0">
              {ch.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-montserrat font-bold text-white text-sm truncate">{ch.name}</div>
              <div className="text-white/50 text-xs truncate">{ch.topic}</div>
            </div>
            <Icon
              name="ArrowUpRight"
              size={16}
              className="text-white/40 group-hover:text-sky-300 transition-colors flex-shrink-0"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
