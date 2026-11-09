import { useState } from "react";
import { Check, ChevronRight, Users } from "lucide-react";
import { NavBar, Sheet } from "../components";
import { today, useStore } from "../store";

const levels = [
  { name: "普通会员", min: 0 },
  { name: "银卡会员", min: 500 },
  { name: "金卡会员", min: 1000 },
  { name: "黑卡会员", min: 2000 },
];

const feedbackTypes = ["数据纠错", "功能建议", "想追踪的品类", "其他"];

export default function ProfilePage() {
  const {
    points,
    checkIns,
    checkIn,
    favorites,
    followedDishes,
    followedTopics,
    addPoints,
    showToast,
    profile,
    setEditingProfile,
  } = useStore();
  const {
    feedbackOpen: feedback,
    setFeedbackOpen: setFeedback,
    setPointsOpen,
    setCollectSeg,
    setTab,
  } = useStore();
  const [community, setCommunity] = useState(false);
  const [fType, setFType] = useState(feedbackTypes[0]);
  const [text, setText] = useState("");
  const [contact, setContact] = useState("");

  const lvIdx = levels.reduce((acc, l, i) => (points >= l.min ? i : acc), 0);
  const lv = levels[lvIdx];
  const next = levels[lvIdx + 1];
  const pct = next ? ((points - lv.min) / (next.min - lv.min)) * 100 : 100;
  const checked = checkIns.includes(today());

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    const key = d.toISOString().slice(0, 10);
    return {
      key,
      label: i === 6 ? "今" : "日一二三四五六"[d.getDay()],
      done: checkIns.includes(key),
    };
  });

  const stats = [
    { n: Object.keys(favorites).length, l: "收藏", seg: "fav" as const },
    { n: followedDishes.length, l: "关注单品", seg: "follow" as const },
    { n: followedTopics.length, l: "关注话题", seg: "topic" as const },
  ];

  const menu = [
    [{ label: "消息通知" }, { label: "关于热品集" }],
    [{ label: "意见反馈", hint: "提交可得 20 积分", onClick: () => setFeedback(true) }],
  ];

  return (
    <div>
      <NavBar />
      <button
        onClick={() => setEditingProfile(true)}
        className="flex w-full items-center gap-3.5 px-5 pb-5 pt-4 text-left active:opacity-70"
      >
        <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-ink text-[20px] font-medium text-white">
          {profile.avatar ? (
            <img src={profile.avatar} alt="头像" className="size-full object-cover" />
          ) : (
            profile.name.slice(0, 1)
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-[19px] font-semibold">
            <span className="truncate">{profile.name}</span>
            <span className="shrink-0 text-[11.5px] font-normal text-mute">{lv.name}</span>
          </span>
          <span className="mt-0.5 block truncate text-[12.5px] text-mute">
            {[profile.brand, profile.types.join("/"), profile.city, profile.scale]
              .filter(Boolean)
              .join(" · ")}
          </span>
          <span className="mt-1.5 flex items-center gap-1.5 text-[11.5px]">
            <span
              className={`size-1.5 rounded-full ${profile.analyzedAt ? "bg-accent" : "bg-ink/25"}`}
            />
            <span className={profile.analyzedAt ? "text-accent" : "text-ink/60"}>
              {profile.analyzedAt ? "AI 经营画像已生成" : "完善经营画像，获取 AI 推荐 · +50 积分"}
            </span>
          </span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-ink/25" />
      </button>

      <section className="mx-4 rounded-[22px] bg-ink p-5 text-white">
        <div className="flex items-end justify-between">
          <button onClick={() => setPointsOpen(true)} className="text-left">
            <p className="flex items-center text-[12px] text-white/55">
              我的积分 <ChevronRight className="size-3.5" />
            </p>
            <p className="mt-1.5 text-[40px] font-semibold leading-none tabular-nums">
              {points.toLocaleString()}
            </p>
          </button>
          <div className="flex gap-2">
            <button
              onClick={checkIn}
              disabled={checked}
              className="h-9 rounded-lg border border-white/20 px-3 text-[12.5px] disabled:border-transparent disabled:text-white/40"
            >
              {checked ? "已签到" : "签到 +10"}
            </button>
            <button
              onClick={() => setPointsOpen(true)}
              className="h-9 rounded-lg bg-white px-3.5 text-[12.5px] font-medium text-ink"
            >
              兑换
            </button>
          </div>
        </div>
        <div className="mt-5">
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-[11.5px] text-white/50">
            {lv.name} · {next ? `再获得 ${next.min - points} 积分升级${next.name}` : "已是最高等级"}
          </p>
        </div>
        <div className="mt-4 flex justify-between border-t border-white/10 pt-4">
          {week.map((d) => (
            <div key={d.key} className="flex flex-col items-center gap-1.5">
              <span
                className={`grid size-7 place-items-center rounded-full text-[10px] ${
                  d.done ? "bg-accent text-white" : "bg-white/8 text-white/40"
                }`}
              >
                {d.done ? <Check className="size-3.5" strokeWidth={2.6} /> : "+10"}
              </span>
              <span className="text-[10.5px] text-white/40">{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-4 mt-3 grid grid-cols-3 rounded-2xl bg-white py-2.5">
        {stats.map((s, i) => (
          <button
            key={s.l}
            onClick={() => {
              setCollectSeg(s.seg);
              setTab("collect");
            }}
            className={`flex items-baseline justify-center gap-1.5 py-1 active:opacity-60 ${i ? "border-l border-line" : ""}`}
          >
            <span className="text-[15px] font-semibold tabular-nums">{s.n}</span>
            <span className="text-[11.5px] text-mute">{s.l}</span>
          </button>
        ))}
      </section>

      <div className="space-y-3 px-4 pb-10 pt-3">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-paper">
            <Users className="size-[17px]" strokeWidth={1.8} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-medium">加入老板社群</span>
            <span className="mt-0.5 block truncate text-[12px] text-mute">
              2,300+ 位餐饮老板交流爆品与经营
            </span>
          </span>
          <button
            onClick={() => setCommunity(true)}
            className="shrink-0 rounded-lg bg-ink px-3.5 py-1.5 text-[12.5px] text-white"
          >
            加入
          </button>
        </div>

        {menu.map((g, gi) => (
          <ul key={gi} className="rounded-2xl bg-white">
            {g.map((item) => (
              <li key={item.label} className="border-b border-line last:border-0">
                <button
                  onClick={
                    "onClick" in item && item.onClick
                      ? item.onClick
                      : () => showToast(`「${item.label}」即将开放`)
                  }
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                >
                  <span className="flex-1 text-[14px]">{item.label}</span>
                  {"hint" in item && <span className="text-[12px] text-mute">{item.hint}</span>}
                  <ChevronRight className="size-4 text-ink/25" />
                </button>
              </li>
            ))}
          </ul>
        ))}
      </div>

      {community && (
        <Sheet title="加入老板社群" onClose={() => setCommunity(false)}>
          <div className="px-5">
            <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-7">
              <QrCode />
              <p className="mt-4 text-[14px] font-medium">热品集 · 餐饮老板交流群</p>
              <p className="mt-1 text-center text-[12px] leading-relaxed text-mute">
                微信扫码添加小助手，备注“品类 + 城市”
                <br />
                每周分享同城爆品与经营案例
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-2xl bg-white px-4 py-3.5">
              <span className="text-[13px]">
                <span className="text-mute">小助手微信号</span>
                <span className="ml-2 font-medium">repinji_club</span>
              </span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText("repinji_club").catch(() => {});
                  showToast("微信号已复制");
                }}
                className="rounded-lg border border-line px-3 py-1 text-[12px]"
              >
                复制
              </button>
            </div>
            <button
              onClick={() => {
                setCommunity(false);
                showToast("二维码已保存到相册");
              }}
              className="mt-4 h-11 w-full rounded-xl bg-ink text-[14px] text-white"
            >
              保存二维码
            </button>
          </div>
        </Sheet>
      )}

      {feedback && (
        <Sheet title="意见反馈" onClose={() => setFeedback(false)}>
          <form
            className="px-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (text.trim().length < 5) return;
              addPoints(20, "提交意见反馈");
              setText("");
              setContact("");
              setFeedback(false);
              showToast("感谢反馈，已获得 20 积分");
            }}
          >
            <div className="flex flex-wrap gap-2">
              {feedbackTypes.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setFType(t)}
                  className={`rounded-lg px-3 py-1.5 text-[13px] ${fType === t ? "bg-ink text-white" : "bg-white text-ink/70"}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="relative mt-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 300))}
                rows={5}
                placeholder="描述问题或建议，至少 5 个字"
                className="w-full resize-none rounded-xl bg-white p-4 text-[14px] leading-relaxed outline-none"
              />
              <span className="absolute bottom-3 right-4 text-[11px] text-mute">
                {text.length}/300
              </span>
            </div>
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="手机号或微信（选填）"
              className="mt-2.5 h-12 w-full rounded-xl bg-white px-4 text-[14px] outline-none"
            />
            <button
              disabled={text.trim().length < 5}
              className="mt-5 h-11 w-full rounded-xl bg-ink text-[14px] text-white disabled:opacity-30"
            >
              提交
            </button>
          </form>
        </Sheet>
      )}
    </div>
  );
}

// Decorative QR placeholder; deterministic pattern with finder squares.
function QrCode() {
  const n = 25;
  const cells: [number, number][] = [];
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const inFinder = (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
      if (!inFinder && (x * 7 + y * 13 + x * y) % 5 < 2) cells.push([x, y]);
    }
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width="7" height="7" fill="#121212" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="#121212" />
    </g>
  );
  return (
    <svg
      viewBox={`0 0 ${n} ${n}`}
      className="size-40"
      shapeRendering="crispEdges"
      aria-label="社群二维码"
    >
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#121212" />
      ))}
      {finder(0, 0)}
      {finder(n - 7, 0)}
      {finder(0, n - 7)}
    </svg>
  );
}
