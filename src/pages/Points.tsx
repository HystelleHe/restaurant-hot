import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Capsule, Sheet } from "../components";
import { today, useStore } from "../store";

const rewards = [
  { id: "r1", title: "品类月度热点报告", desc: "任选 1 个品类，PDF 深度报告", cost: 300 },
  { id: "r2", title: "同城竞品动态周报", desc: "连续 4 期，覆盖你所在城市", cost: 500 },
  { id: "r3", title: "会员时长 7 天", desc: "解锁全量数据与历史趋势", cost: 600 },
  { id: "r4", title: "新品研发选品清单", desc: "按你的画像生成 20 个候选单品", cost: 800 },
  { id: "r5", title: "一对一选品顾问 30 分钟", desc: "资深餐饮顾问线上沟通", cost: 2000 },
];

const tabs = ["兑换", "明细"] as const;

export default function PointsPage() {
  const {
    pointsOpen,
    setPointsOpen,
    points,
    ledger,
    spendPoints,
    showToast,
    checkIns,
    checkIn,
    profile,
    setEditingProfile,
    setFeedbackOpen,
  } = useStore();
  const [tab, setTab] = useState<(typeof tabs)[number]>("兑换");
  const [confirm, setConfirm] = useState<(typeof rewards)[number] | null>(null);
  if (!pointsOpen) return null;

  const earned = ledger.filter((l) => l.delta > 0).reduce((a, l) => a + l.delta, 0);
  const spent = -ledger.filter((l) => l.delta < 0).reduce((a, l) => a + l.delta, 0);
  const checked = checkIns.includes(today());

  const ways = [
    { title: "每日签到", reward: "+10", done: checked, action: checkIn },
    {
      title: "完善经营画像",
      reward: "+50",
      done: !!profile.analyzedAt,
      action: () => {
        setPointsOpen(false);
        setEditingProfile(true);
      },
    },
    {
      title: "提交意见反馈",
      reward: "+20",
      done: false,
      action: () => {
        setPointsOpen(false);
        setFeedbackOpen(true);
      },
    },
  ];

  return (
    <div className="animate-fade absolute inset-x-0 bottom-0 top-11 z-40 flex flex-col bg-paper">
      <div className="relative flex h-11 shrink-0 items-center justify-between px-3">
        <button
          onClick={() => setPointsOpen(false)}
          aria-label="返回"
          className="grid size-9 place-items-center"
        >
          <ChevronLeft className="size-[22px]" />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[16px] font-semibold">积分兑换</h1>
        <div className="pr-2">
          <Capsule />
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto">
        <section className="px-5 pb-6 pt-4">
          <p className="text-[12px] text-mute">可用积分</p>
          <p className="mt-1 text-[40px] font-semibold leading-none tabular-nums">
            {points.toLocaleString()}
          </p>
          <p className="mt-3 text-[12px] text-mute">
            累计获得 <span className="tabular-nums text-ink">{earned.toLocaleString()}</span>
            <span className="mx-2 text-line">|</span>
            累计使用 <span className="tabular-nums text-ink">{spent.toLocaleString()}</span>
          </p>
        </section>

        <div className="sticky top-0 z-10 flex gap-6 border-b border-line bg-paper px-5">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative pb-2.5 text-[14px] ${tab === t ? "font-semibold" : "text-ink/45"}`}
            >
              {t === "兑换" ? "积分兑换" : "积分明细"}
              {tab === t && <span className="absolute inset-x-0 -bottom-px h-[2px] bg-ink" />}
            </button>
          ))}
        </div>

        {tab === "兑换" && (
          <div className="px-4 pb-10 pt-4">
            <ul className="rounded-2xl bg-white">
              {rewards.map((r) => {
                const enough = points >= r.cost;
                return (
                  <li
                    key={r.id}
                    className="flex items-center gap-3 border-b border-line px-4 py-3.5 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium">{r.title}</p>
                      <p className="mt-0.5 truncate text-[12px] text-mute">{r.desc}</p>
                      <p className="mt-1 text-[13px] font-semibold tabular-nums">
                        {r.cost.toLocaleString()} 积分
                      </p>
                    </div>
                    <button
                      disabled={!enough}
                      onClick={() => setConfirm(r)}
                      className="shrink-0 rounded-lg bg-ink px-3.5 py-1.5 text-[12.5px] text-white disabled:bg-paper disabled:text-mute"
                    >
                      {enough ? "兑换" : "积分不足"}
                    </button>
                  </li>
                );
              })}
            </ul>

            <p className="px-1 pb-2 pt-6 text-[12px] text-mute">赚积分</p>
            <ul className="rounded-2xl bg-white">
              {ways.map((w) => (
                <li
                  key={w.title}
                  className="flex items-center gap-3 border-b border-line px-4 py-3.5 last:border-0"
                >
                  <span className="flex-1 text-[14px]">{w.title}</span>
                  <span className="text-[12.5px] tabular-nums text-accent">{w.reward}</span>
                  <button
                    disabled={w.done}
                    onClick={w.action}
                    className="w-16 shrink-0 rounded-lg border border-line py-1 text-[12px] disabled:border-transparent disabled:text-mute"
                  >
                    {w.done ? "已完成" : "去完成"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === "明细" && (
          <div className="px-4 pb-10 pt-4">
            {ledger.length === 0 ? (
              <p className="py-16 text-center text-[13px] text-mute">暂无积分记录</p>
            ) : (
              <ul className="rounded-2xl bg-white">
                {ledger.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center gap-3 border-b border-line px-4 py-3.5 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px]">{l.title}</p>
                      <p className="mt-0.5 text-[11.5px] tabular-nums text-mute">{l.date}</p>
                    </div>
                    <span
                      className={`shrink-0 text-[15px] font-semibold tabular-nums ${l.delta > 0 ? "text-accent" : "text-ink"}`}
                    >
                      {l.delta > 0 ? "+" : ""}
                      {l.delta.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {confirm && (
        <Sheet title="确认兑换" onClose={() => setConfirm(null)}>
          <div className="px-5">
            <div className="rounded-2xl bg-white p-4">
              <p className="text-[15px] font-medium">{confirm.title}</p>
              <p className="mt-1 text-[12.5px] text-mute">{confirm.desc}</p>
              <div className="mt-4 flex justify-between border-t border-line pt-3 text-[13px]">
                <span className="text-mute">消耗积分</span>
                <span className="font-semibold tabular-nums">{confirm.cost.toLocaleString()}</span>
              </div>
              <div className="mt-2 flex justify-between text-[13px]">
                <span className="text-mute">兑换后剩余</span>
                <span className="tabular-nums">{(points - confirm.cost).toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={() => {
                if (spendPoints(confirm.cost, `兑换 ${confirm.title}`))
                  showToast("兑换成功，可在消息通知中查看");
                setConfirm(null);
              }}
              className="mt-4 h-11 w-full rounded-xl bg-ink text-[14px] text-white"
            >
              确认兑换
            </button>
          </div>
        </Sheet>
      )}
    </div>
  );
}
