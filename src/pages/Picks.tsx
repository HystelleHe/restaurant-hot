import { ChevronLeft } from "lucide-react";
import { Capsule, TrendList } from "../components";
import { dishes } from "../data";
import { useStore, type PicksTab } from "../store";

const tabs: { key: PicksTab; label: string; desc: string }[] = [
  { key: "rising", label: "7 日飙升", desc: "近 7 日热度持续上升的单品，按增速排序" },
  { key: "emerging", label: "萌芽期单品", desc: "刚开始起量、跟进门店少，适合提前布局" },
  { key: "updates", label: "关注更新", desc: "你关注的单品出现的热度异动与扩散" },
];

export default function PicksPage() {
  const { picks, openPicks, followedDishes, readUpdates, markRead } = useStore();
  if (!picks) return null;

  const rising = dishes.filter((d) => d.growth > 0).sort((a, b) => b.growth - a.growth);
  const emerging = dishes.filter((d) => d.stage === "萌芽").sort((a, b) => b.growth - a.growth);
  const updates = dishes.filter((d) => followedDishes.includes(d.id) && d.update);
  const unread = updates.filter((d) => !readUpdates.includes(d.id));
  const counts = { rising: rising.length, emerging: emerging.length, updates: unread.length };
  const current = tabs.find((t) => t.key === picks)!;

  const date = new Date();
  const dateLabel = `${date.getMonth() + 1} 月 ${date.getDate()} 日 · 周${"日一二三四五六"[date.getDay()]}`;

  return (
    <div className="animate-fade absolute inset-x-0 bottom-0 top-11 z-40 flex flex-col bg-paper">
      <div className="relative flex h-11 shrink-0 items-center justify-between px-3">
        <button
          onClick={() => openPicks(null)}
          aria-label="返回"
          className="grid size-9 place-items-center"
        >
          <ChevronLeft className="size-[22px]" />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[16px] font-semibold">本日精选</h1>
        <div className="pr-2">
          <Capsule />
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto">
        <div className="px-5 pb-4 pt-3">
          <p className="text-[12px] text-mute">{dateLabel}</p>
          <p className="mt-1 text-[13px] text-ink/70">{current.desc}</p>
        </div>

        <div className="sticky top-0 z-10 flex gap-6 border-b border-line bg-paper px-5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => openPicks(t.key)}
              className={`relative pb-2.5 pt-1 text-[14px] ${picks === t.key ? "font-semibold" : "text-ink/45"}`}
            >
              {t.label}
              <span
                className={`ml-1 text-[11px] font-normal ${t.key === "updates" && counts.updates ? "text-accent" : "text-mute"}`}
              >
                {counts[t.key]}
              </span>
              {picks === t.key && <span className="absolute inset-x-0 -bottom-px h-[2px] bg-ink" />}
            </button>
          ))}
        </div>

        <div className="px-4 pb-10 pt-4">
          {picks === "rising" && <TrendList items={rising} />}
          {picks === "emerging" && <TrendList items={emerging} />}
          {picks === "updates" &&
            (updates.length === 0 ? (
              <p className="py-16 text-center text-[13px] text-mute">还没有关注的单品</p>
            ) : (
              <>
                {unread.length > 0 && (
                  <div className="flex justify-end px-1 pb-2.5">
                    <button
                      onClick={() => unread.forEach((d) => markRead(d.id))}
                      className="text-[12px] text-mute"
                    >
                      全部标为已读
                    </button>
                  </div>
                )}
                <div className="space-y-2">
                  {updates.map((d) => {
                    const isNew = !readUpdates.includes(d.id);
                    return (
                      <div key={d.id} onClick={() => markRead(d.id)}>
                        <div className="flex items-center gap-2 px-1 pb-1.5 text-[12px]">
                          <span
                            className={`size-1.5 shrink-0 rounded-full ${isNew ? "bg-accent" : "bg-ink/15"}`}
                          />
                          <span className={`truncate ${isNew ? "text-ink" : "text-mute"}`}>
                            {d.update!.text}
                          </span>
                          <span className="ml-auto shrink-0 text-[11px] text-mute">
                            {d.update!.time}
                          </span>
                        </div>
                        <TrendList items={[d]} />
                      </div>
                    );
                  })}
                </div>
              </>
            ))}
        </div>
      </div>
    </div>
  );
}
