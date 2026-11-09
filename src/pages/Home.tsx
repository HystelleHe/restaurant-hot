import { useState } from "react";
import { ArrowRight, ChevronRight, Search, X } from "lucide-react";
import { Growth, NavBar, SectionTitle } from "../components";
import { dishes } from "../data";
import { matchTrends } from "../match";
import { useStore } from "../store";

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "早上好";
  if (h < 14) return "中午好";
  if (h < 18) return "下午好";
  return "晚上好";
}

export default function HomePage() {
  const {
    profile,
    setEditingProfile,
    openPicks,
    setQuery,
    setTab,
    followedDishes,
    readUpdates,
    openDish,
  } = useStore();
  const [input, setInput] = useState("");

  const go = (q: string) => {
    setQuery(q);
    setTab("square");
  };

  const updates = dishes.filter((d) => followedDishes.includes(d.id) && d.update);
  const unread = updates.filter((d) => !readUpdates.includes(d.id)).length;
  const rising = dishes.filter((d) => d.growth > 0).length;
  const recs = profile.analyzedAt ? matchTrends(profile, 3) : [];
  const now = new Date();
  const todayLabel = `${now.getMonth() + 1} 月 ${now.getDate()} 日`;
  const emerging = dishes.filter((d) => d.stage === "萌芽").length;

  return (
    <div>
      <NavBar left={<span className="text-[16px] font-semibold tracking-tight">热品集</span>} />

      <section className="px-5 pb-10 pt-8">
        <p className="text-[13px] text-mute">
          {greeting()}，{profile.name}
        </p>
        <h1 className="mt-1.5 text-[30px] font-semibold leading-[1.25] tracking-tight">
          今天想追踪哪个爆品？
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            go(input.trim());
          }}
          className="mt-6 rounded-[22px] bg-white p-2 shadow-[0_1px_0_rgba(0,0,0,0.03),0_12px_32px_-16px_rgba(0,0,0,0.18)]"
        >
          <label className="flex h-16 items-center gap-3 px-4">
            <Search className="size-[22px] shrink-0 text-ink" strokeWidth={2} />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入单品、品类、城市或账号"
              className="min-w-0 flex-1 bg-transparent text-[18px] font-medium outline-none placeholder:font-normal placeholder:text-ink/30"
            />
            {input && (
              <button
                type="button"
                aria-label="清除"
                onClick={() => setInput("")}
                className="text-mute"
              >
                <X className="size-[18px]" />
              </button>
            )}
          </label>
          <div className="flex items-center justify-between rounded-2xl bg-paper py-2 pl-4 pr-2">
            <span className="text-[11.5px] text-mute">小红书 · 抖音 · 大众点评 实时热度</span>
            <button
              type="submit"
              className="flex h-10 items-center gap-1.5 rounded-xl bg-ink px-5 text-[14px] font-medium text-white"
            >
              搜索
              <ArrowRight className="size-4" />
            </button>
          </div>
        </form>
      </section>

      <section className="px-5 pb-8">
        <SectionTitle
          title="本日精选"
          action={<span className="text-[12px] text-mute">{todayLabel}</span>}
        />
        <div className="grid grid-cols-3 rounded-2xl bg-white py-4">
          {[
            { v: rising, l: "7 日飙升", k: "rising" as const },
            { v: emerging, l: "萌芽期单品", k: "emerging" as const },
            { v: unread, l: "关注更新", k: "updates" as const, accent: unread > 0 },
          ].map((s, i) => (
            <button
              key={s.l}
              onClick={() => openPicks(s.k)}
              className={`px-4 text-left transition active:opacity-60 ${i ? "border-l border-line" : ""}`}
            >
              <p
                className={`text-[22px] font-semibold tabular-nums ${s.accent ? "text-accent" : ""}`}
              >
                {s.v}
              </p>
              <p className="mt-0.5 flex items-center text-[11.5px] text-mute">
                {s.l}
                <ChevronRight className="size-3" />
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 pb-8">
        {profile.analyzedAt ? (
          <>
            <SectionTitle
              title="为你推荐"
              action={
                <button
                  onClick={() => {
                    setTab("me");
                    setEditingProfile(true);
                  }}
                  className="flex items-center text-[12px] text-mute"
                >
                  调整画像 <ChevronRight className="size-3.5" />
                </button>
              }
            />
            <ul className="rounded-2xl bg-white">
              {recs.map((m) => (
                <li key={m.dish.id} className="border-b border-line last:border-0">
                  <button
                    onClick={() => openDish(m.dish.id)}
                    className="flex w-full items-center gap-3 p-3 text-left"
                  >
                    <img
                      src={m.dish.image}
                      alt={m.dish.name}
                      className="size-12 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium">{m.dish.name}</p>
                      <p className="mt-0.5 truncate text-[11.5px] text-mute">
                        {m.reasons.slice(0, 3).join(" · ")}
                      </p>
                    </div>
                    <Growth g={m.dish.growth} className="shrink-0 text-[12.5px] font-medium" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <button
            onClick={() => {
              setTab("me");
              setEditingProfile(true);
            }}
            className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-4 text-left"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium">完善经营画像，获取 AI 推荐</span>
              <span className="mt-0.5 block text-[12px] text-mute">
                告诉我们你的店铺类型与规模，只推送和你强相关的热点
              </span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-ink/25" />
          </button>
        )}
      </section>
    </div>
  );
}
