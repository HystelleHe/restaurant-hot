import { useEffect, useRef, useState, type ReactNode } from "react";
import { Camera, Check, ChevronLeft, ChevronRight, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Capsule, Growth, Sheet } from "../components";
import { categories, dishes } from "../data";
import { cityRegion, matchTrends } from "../match";
import { useStore, type UserProfile } from "../store";

const roles = ["老板 / 创始人", "店长", "主厨 / 研发", "运营 / 市场"];
const modes = ["直营", "加盟店", "个体经营", "品牌加盟方"];
const scales = ["1 家", "2–5 家", "6–20 家", "20 家以上"];
const areas = ["30㎡ 以下", "30–80㎡", "80–200㎡", "200㎡ 以上"];
const prices = ["15 元以下", "15–30 元", "30–60 元", "60–100 元", "100 元以上"];
const customerOpts = ["学生", "白领", "家庭", "年轻情侣", "游客", "社区居民"];
const channelOpts = ["堂食", "外卖", "团购", "小程序自提"];
const goalOpts = ["找新品", "降成本", "提客单", "拓门店", "引流获客"];
const shopTypes = categories.filter((c) => c !== "全部");

type Phase = "form" | "analyzing" | "done";
type PlatformKey = "小红书" | "抖音";
const platforms: { key: PlatformKey; glyph: string }[] = [
  { key: "小红书", glyph: "书" },
  { key: "抖音", glyph: "抖" },
];

export default function ProfileEdit() {
  const { editingProfile, setEditingProfile, profile } = useStore();
  if (!editingProfile) return null;
  return <Editor key="editor" initial={profile} onClose={() => setEditingProfile(false)} />;
}

function Editor({ initial, onClose }: { initial: UserProfile; onClose: () => void }) {
  const { setProfile, addPoints, showToast, setTab } = useStore();
  const [p, setP] = useState<UserProfile>(initial);
  const [phase, setPhase] = useState<Phase>("form");
  const [linking, setLinking] = useState<PlatformKey | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof UserProfile>(k: K, v: UserProfile[K]) =>
    setP((x) => ({ ...x, [k]: v }));
  const toggle = (k: "types" | "customers" | "channels" | "goals", v: string) =>
    setP((x) => ({ ...x, [k]: x[k].includes(v) ? x[k].filter((i) => i !== v) : [...x[k], v] }));

  const checks = [
    !!p.name.trim(),
    !!p.role,
    !!p.brand.trim(),
    !!p.city,
    p.types.length > 0,
    !!p.mode,
    !!p.scale,
    !!p.area,
    !!p.price,
    p.customers.length > 0,
    p.channels.length > 0,
    p.goals.length > 0,
  ];
  const required = checks[0] && checks[2] && checks[3] && checks[4] && checks[6] && checks[8];
  const pct = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  const onAvatar = (file?: File) => {
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const size = 240;
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const s = Math.min(img.width, img.height);
      c.getContext("2d")!.drawImage(
        img,
        (img.width - s) / 2,
        (img.height - s) / 2,
        s,
        s,
        0,
        0,
        size,
        size,
      );
      set("avatar", c.toDataURL("image/jpeg", 0.85));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  };

  const submit = () => {
    const first = !initial.analyzedAt;
    setProfile({ ...p, analyzedAt: new Date().toISOString() });
    if (first) addPoints(50, "完善经营画像");
    setPhase("analyzing");
  };

  return (
    <div className="absolute inset-x-0 bottom-0 top-11 z-40 flex flex-col bg-paper animate-fade">
      <div className="relative flex h-11 shrink-0 items-center justify-between px-3">
        {phase === "form" ? (
          <button onClick={onClose} aria-label="返回" className="grid size-9 place-items-center">
            <ChevronLeft className="size-[22px]" />
          </button>
        ) : (
          <span className="size-9" />
        )}
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[16px] font-semibold">
          {phase === "form" ? "经营画像" : phase === "analyzing" ? "AI 分析中" : "分析完成"}
        </h1>
        <div className="pr-2">
          <Capsule />
        </div>
      </div>

      {phase === "form" && (
        <>
          <div className="no-scrollbar flex-1 overflow-y-auto pb-6">
            <div className="px-5 pb-5 pt-3">
              <div className="flex items-baseline justify-between">
                <p className="text-[13px] text-ink/70">完善信息，AI 将为你推送强相关热点</p>
                <span className="text-[12px] tabular-nums text-mute">{pct}%</span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-ink transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-4 flex gap-2.5 rounded-xl bg-white px-3.5 py-3">
                <ShieldCheck className="mt-px size-4 shrink-0 text-accent" strokeWidth={1.8} />
                <p className="text-[12px] leading-relaxed text-ink/70">
                  <span className="font-medium text-ink">你的信息严格保密</span>
                  ，仅用于补充经营画像、生成个性化推荐，不会公开展示，也不会提供给任何第三方。
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center pb-6">
              <button
                onClick={() => fileRef.current?.click()}
                className="relative size-20 overflow-hidden rounded-full bg-ink text-white"
                aria-label="更换头像"
              >
                {p.avatar ? (
                  <img src={p.avatar} alt="头像" className="size-full object-cover" />
                ) : (
                  <span className="text-[28px] font-medium">
                    {p.name.trim().slice(0, 1) || "?"}
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 grid h-6 place-items-center bg-black/45">
                  <Camera className="size-3.5" />
                </span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onAvatar(e.target.files?.[0])}
              />
              <span className="mt-2 text-[12px] text-mute">点击更换头像</span>
            </div>

            <Group title="基本信息">
              <Field label="姓名" required>
                <TextInput value={p.name} onChange={(v) => set("name", v)} placeholder="你的称呼" />
              </Field>
              <Field label="身份">
                <Chips options={roles} value={[p.role]} onPick={(v) => set("role", v)} />
              </Field>
              <Field label="联系方式">
                <TextInput
                  value={p.phone}
                  onChange={(v) => set("phone", v)}
                  placeholder="手机号或微信（选填）"
                />
              </Field>
            </Group>

            <Group title="店铺信息">
              <Field label="品牌 / 店名" required>
                <TextInput
                  value={p.brand}
                  onChange={(v) => set("brand", v)}
                  placeholder="例如：柒号茶铺"
                />
              </Field>
              <Field label="所在城市" required>
                <div className="relative">
                  <select
                    value={p.city}
                    onChange={(e) => set("city", e.target.value)}
                    className="h-10 w-full appearance-none rounded-lg bg-paper px-3 text-[14px] outline-none"
                  >
                    {Object.keys(cityRegion).map((c) => (
                      <option key={c} value={c}>
                        {c} · {cityRegion[c]}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="pointer-events-none absolute right-3 top-3 size-4 rotate-90 text-mute" />
                </div>
              </Field>
              <Field label="店铺类型" hint="可多选" required>
                <Chips options={shopTypes} value={p.types} onPick={(v) => toggle("types", v)} />
              </Field>
              <Field label="经营模式">
                <Chips options={modes} value={[p.mode]} onPick={(v) => set("mode", v)} />
              </Field>
              <Field label="门店规模" required>
                <Chips options={scales} value={[p.scale]} onPick={(v) => set("scale", v)} />
              </Field>
              <Field label="单店面积">
                <Chips options={areas} value={[p.area]} onPick={(v) => set("area", v)} />
              </Field>
              <Field label="人均客单价" required>
                <Chips options={prices} value={[p.price]} onPick={(v) => set("price", v)} />
              </Field>
              <Field label="关联平台账号" hint="用于同步店铺声量，匹配更精准">
                <div className="divide-y divide-line overflow-hidden rounded-lg bg-paper">
                  {platforms.map((pf) => {
                    const handle = p.accounts?.[pf.key];
                    return (
                      <div key={pf.key} className="flex items-center gap-3 px-3 py-2.5">
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-ink text-[13px] font-semibold text-white">
                          {pf.glyph}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13.5px]">{pf.key}</span>
                          <span
                            className={`block truncate text-[11.5px] ${handle ? "text-accent" : "text-mute"}`}
                          >
                            {handle ? `已关联 ${handle}` : "未关联"}
                          </span>
                        </span>
                        {handle ? (
                          <button
                            type="button"
                            onClick={() =>
                              setP((x) => ({
                                ...x,
                                accounts: { ...x.accounts, [pf.key]: undefined },
                              }))
                            }
                            className="shrink-0 rounded-md border border-line bg-white px-2.5 py-1 text-[12px] text-mute"
                          >
                            解除
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setLinking(pf.key)}
                            className="shrink-0 rounded-md bg-ink px-2.5 py-1 text-[12px] text-white"
                          >
                            关联
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Field>
            </Group>

            <Group title="经营情况">
              <Field label="主要客群" hint="可多选">
                <Chips
                  options={customerOpts}
                  value={p.customers}
                  onPick={(v) => toggle("customers", v)}
                />
              </Field>
              <Field label="经营渠道" hint="可多选">
                <Chips
                  options={channelOpts}
                  value={p.channels}
                  onPick={(v) => toggle("channels", v)}
                />
              </Field>
              <Field label="当前目标" hint="可多选">
                <Chips options={goalOpts} value={p.goals} onPick={(v) => toggle("goals", v)} />
              </Field>
            </Group>
          </div>

          <div className="shrink-0 border-t border-line bg-white px-5 pb-7 pt-3">
            <button
              disabled={!required}
              onClick={submit}
              className="h-11 w-full rounded-xl bg-ink text-[14px] text-white transition disabled:opacity-30"
            >
              保存并生成 AI 推荐
            </button>
            <p className="mt-2 flex items-center justify-center gap-1 text-[11.5px] text-mute">
              {required ? (
                <>
                  <Lock className="size-3" />
                  信息加密存储，仅用于画像分析
                </>
              ) : (
                "请先完成带 * 的必填项"
              )}
            </p>
          </div>
        </>
      )}

      {linking && (
        <LinkSheet
          platform={linking}
          onClose={() => setLinking(null)}
          onLinked={(handle) => {
            setP((x) => ({ ...x, accounts: { ...x.accounts, [linking]: handle } }));
            setLinking(null);
            showToast(`${linking}账号已关联`);
          }}
        />
      )}

      {phase === "analyzing" && <Analyzing profile={p} onDone={() => setPhase("done")} />}

      {phase === "done" && (
        <Result
          profile={p}
          onFinish={() => {
            onClose();
            setTab("home");
            showToast(initial.analyzedAt ? "首页推荐已更新" : "首页推荐已更新 · +50 积分");
          }}
        />
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mx-4 mb-3 rounded-2xl bg-white px-4 pb-1 pt-4">
      <h2 className="mb-1 text-[13px] font-semibold">{title}</h2>
      <div className="divide-y divide-line">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="py-3.5">
      <p className="mb-2 text-[12.5px] text-ink/70">
        {label}
        {required && <span className="ml-0.5 text-accent">*</span>}
        {hint && <span className="ml-1.5 text-[11px] text-mute">{hint}</span>}
      </p>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={30}
      className="h-10 w-full rounded-lg bg-paper px-3 text-[14px] outline-none placeholder:text-mute"
    />
  );
}

function Chips({
  options,
  value,
  onPick,
}: {
  options: readonly string[];
  value: string[];
  onPick: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => onPick(o)}
            className={`rounded-lg px-3 py-1.5 text-[13px] transition ${on ? "bg-ink text-white" : "bg-paper text-ink/70"}`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function Analyzing({ profile, onDone }: { profile: UserProfile; onDone: () => void }) {
  const region = cityRegion[profile.city] ?? "全国";
  const linked = platforms.filter((pf) => profile.accounts?.[pf.key]).map((pf) => pf.key);
  const steps = [
    `解析经营画像 · ${profile.brand}`,
    `比对 ${profile.types.join(" / ")} 品类 1,248 条热度信号`,
    `扫描${region}与${profile.city}同城首发动态`,
    `结合 ${profile.price} 价格带筛选可落地单品`,
    ...(linked.length ? [`同步${linked.join(" / ")}账号近 30 日声量`] : []),
    "生成强相关热点推送",
  ];
  const keywords = dishes.flatMap((d) => [d.name, ...d.keywords, d.origin.account]);
  const [progress, setProgress] = useState(0);
  const [kw, setKw] = useState(0);
  const DURATION = 5200;
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const r = Math.min(1, (t - start) / DURATION);
      setProgress(1 - (1 - r) ** 1.6);
      if (r < 1) raf = requestAnimationFrame(tick);
      else window.setTimeout(() => doneRef.current(), 450);
    };
    raf = requestAnimationFrame(tick);
    const k = window.setInterval(() => setKw((i) => i + 1), 140);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(k);
    };
  }, []);

  const active = Math.min(steps.length - 1, Math.floor(progress * steps.length));
  const R = 54;
  const C = 2 * Math.PI * R;

  return (
    <div className="flex flex-1 flex-col items-center px-8 pt-10">
      <div className="relative grid size-[200px] place-items-center">
        {[0, 0.8, 1.6].map((d) => (
          <span
            key={d}
            className="animate-ripple absolute inset-0 rounded-full border border-ink/15"
            style={{ animationDelay: `${d}s` }}
          />
        ))}
        <svg viewBox="0 0 128 128" className="absolute size-[140px] -rotate-90">
          <circle cx="64" cy="64" r={R} fill="none" stroke="#ececec" strokeWidth="3" />
          <circle
            cx="64"
            cy="64"
            r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-ink"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
          />
        </svg>
        <div className="relative text-center">
          <p className="text-[30px] font-semibold tabular-nums leading-none">
            {Math.round(progress * 100)}
          </p>
          <p className="mt-1 text-[11px] text-mute">%</p>
        </div>
      </div>

      <p className="mt-6 text-[15px] font-medium">AI 正在分析你的经营画像</p>
      <p className="mt-1.5 h-4 text-[12px] text-mute">
        正在扫描：<span className="text-ink/70">{keywords[kw % keywords.length]}</span>
      </p>

      <ul className="mt-9 w-full space-y-3.5">
        {steps.map((s, i) => {
          const done = i < active || progress >= 1;
          const cur = i === active && progress < 1;
          if (i > active) return null;
          return (
            <li key={s} className="animate-rise flex items-center gap-3 text-[13px]">
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-full ${done ? "bg-accent text-white" : "border border-line"}`}
              >
                {done ? (
                  <Check className="size-3" strokeWidth={3} />
                ) : (
                  <Loader2 className="size-3 animate-spin text-ink/50" />
                )}
              </span>
              <span className={cur ? "text-ink" : "text-ink/55"}>{s}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Radar({ data }: { data: { label: string; value: number }[] }) {
  const size = 220;
  const c = size / 2;
  const r = 72;
  const pt = (i: number, k: number) => {
    const ang = -Math.PI / 2 + (i * Math.PI * 2) / data.length;
    return [c + Math.cos(ang) * r * k, c + Math.sin(ang) * r * k];
  };
  const poly = (k: (i: number) => number) => data.map((_, i) => pt(i, k(i)).join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto block w-[230px]">
      {[1, 0.66, 0.33].map((k) => (
        <polygon key={k} points={poly(() => k)} fill="none" stroke="#e6e6e6" strokeWidth="1" />
      ))}
      {data.map((_, i) => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="#eeeeee" strokeWidth="1" />;
      })}
      <g className="animate-grow" style={{ animationDelay: "0.2s" }}>
        <polygon
          points={poly((i) => data[i].value / 100)}
          fill="#121212"
          fillOpacity="0.07"
          stroke="#121212"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {data.map((d, i) => {
          const [x, y] = pt(i, d.value / 100);
          return <circle key={d.label} cx={x} cy={y} r="2.5" fill="#121212" />;
        })}
      </g>
      {data.map((d, i) => {
        const [x, y] = pt(i, 1.32);
        return (
          <text
            key={d.label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10.5"
          >
            <tspan fill="#8e8e8e">{d.label}</tspan>
            <tspan x={x} dy="13" fill="#121212" fontWeight="600">
              {d.value}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}

function Result({ profile, onFinish }: { profile: UserProfile; onFinish: () => void }) {
  const { openDish } = useStore();
  const matches = matchTrends(profile);
  const region = cityRegion[profile.city] ?? "全国";
  const linked = platforms.filter((pf) => profile.accounts?.[pf.key]).length;

  const pick = (opts: string[], v: string, scores: number[]) =>
    scores[Math.max(0, opts.indexOf(v))];
  const radar = [
    {
      label: "上新需求",
      value: profile.goals.includes("找新品") ? 92 : profile.goals.length ? 64 : 45,
    },
    { label: "门店规模", value: pick(scales, profile.scale, [35, 58, 80, 95]) },
    { label: "客单水平", value: pick(prices, profile.price, [30, 50, 68, 82, 95]) },
    {
      label: "渠道覆盖",
      value: Math.round(30 + (profile.channels.length / channelOpts.length) * 65),
    },
    {
      label: "客群广度",
      value: Math.round(30 + (profile.customers.length / customerOpts.length) * 65),
    },
    {
      label: "数据完整",
      value: Math.min(
        98,
        Math.round(40 + linked * 22 + (profile.area ? 8 : 0) + (profile.mode ? 6 : 0)),
      ),
    },
  ];

  return (
    <>
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6">
        <section className="animate-rise rounded-2xl bg-white px-4 pb-4 pt-5">
          <h2 className="px-1 text-[15px] font-semibold">经营画像</h2>
          <p className="mt-0.5 px-1 text-[12px] text-mute">
            {profile.brand} · {profile.types.join(" / ")} · {profile.city}
          </p>
          <Radar data={radar} />
        </section>

        <section
          className="animate-rise mt-3 flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5"
          style={{ animationDelay: "0.9s" }}
        >
          <svg viewBox="0 0 24 24" className="size-6 shrink-0">
            <circle cx="12" cy="12" r="12" className="fill-accent" />
            <path
              d="M7 12.5l3.2 3.2L17 9"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="16"
              strokeDashoffset="16"
              className="animate-draw"
              style={{ animationDelay: "1.2s" }}
            />
          </svg>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-medium">首页推荐已与画像匹配</span>
            <span className="mt-0.5 block truncate text-[12px] text-mute">
              “为你推荐”将按 {profile.types.join(" / ")} · {profile.city} + {region} 展示热点
            </span>
          </span>
        </section>

        <section className="animate-rise mt-6" style={{ animationDelay: "1.5s" }}>
          <div className="mb-2.5 flex items-baseline justify-between px-1">
            <h3 className="text-[15px] font-semibold">当前热点推送</h3>
            <span className="text-[11.5px] text-mute">{matches.length} 个强相关</span>
          </div>
          <ol className="rounded-2xl bg-white">
            {matches.map((m) => (
              <li key={m.dish.id} className="border-b border-line last:border-0">
                <button
                  onClick={() => openDish(m.dish.id)}
                  className="flex w-full items-center gap-3 p-3 text-left"
                >
                  <img
                    src={m.dish.image}
                    alt={m.dish.name}
                    className="size-14 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[14px] font-medium">{m.dish.name}</span>
                      <Growth g={m.dish.growth} className="shrink-0 text-[12px] font-medium" />
                    </div>
                    <p className="mt-1 truncate text-[11.5px] text-mute">
                      {m.reasons.slice(0, 3).join(" · ")}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <div className="shrink-0 border-t border-line bg-white px-5 pb-7 pt-3">
        <button onClick={onFinish} className="h-11 w-full rounded-xl bg-ink text-[14px] text-white">
          去首页查看
        </button>
      </div>
    </>
  );
}

function LinkSheet({
  platform,
  onClose,
  onLinked,
}: {
  platform: PlatformKey;
  onClose: () => void;
  onLinked: (handle: string) => void;
}) {
  const [handle, setHandle] = useState("");
  const [authing, setAuthing] = useState(false);
  const clean = handle.trim().replace(/^@/, "");
  return (
    <Sheet title={`关联${platform}`} onClose={authing ? () => {} : onClose}>
      <form
        className="px-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!clean || authing) return;
          setAuthing(true);
          // Simulated OAuth round-trip.
          window.setTimeout(() => onLinked(`@${clean}`), 1400);
        }}
      >
        <p className="mb-3 text-[12.5px] leading-relaxed text-mute">
          输入店铺的{platform}账号，授权后将同步笔记 /
          视频的互动数据，仅用于分析，不会对外发布任何内容，数据不会泄露给第三方。
        </p>
        <label className="flex h-12 items-center gap-1 rounded-xl bg-white px-4">
          <span className="text-[15px] text-mute">@</span>
          <input
            autoFocus
            value={handle}
            disabled={authing}
            onChange={(e) => setHandle(e.target.value)}
            placeholder={`${platform}号或昵称`}
            maxLength={30}
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-mute"
          />
        </label>
        <button
          disabled={!clean || authing}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[14px] text-white disabled:opacity-40"
        >
          {authing && <Loader2 className="size-4 animate-spin" />}
          {authing ? `正在跳转${platform}授权…` : "授权并关联"}
        </button>
      </form>
    </Sheet>
  );
}
