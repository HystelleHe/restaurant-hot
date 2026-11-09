import { type ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Bookmark, Compass, Home, Star, User, X } from "lucide-react";
import { dishes, formatGrowth, formatNum, type Dish } from "./data";
import { useStore } from "./store";

export function Capsule() {
  return (
    <div className="flex h-8 items-center rounded-full border border-line bg-white px-3 text-[13px]">
      <span className="leading-none tracking-[2px]">•••</span>
      <span className="mx-2.5 h-4 w-px bg-line" />
      <span className="grid size-4 place-items-center rounded-full border-[1.5px] border-ink">
        <span className="size-1.5 rounded-full bg-ink" />
      </span>
    </div>
  );
}

export function NavBar({ left, title }: { left?: ReactNode; title?: string }) {
  return (
    <div className="relative flex h-11 shrink-0 items-center justify-between px-5">
      <div className="min-w-0">{left}</div>
      {title && (
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[16px] font-semibold">{title}</h1>
      )}
      <Capsule />
    </div>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[15px] font-semibold">{title}</h2>
      {action}
    </div>
  );
}

export function Sparkline({
  data,
  up,
  w = 64,
  h = 20,
}: {
  data: number[];
  up: boolean;
  w?: number;
  h?: number;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts = data
    .map(
      (v, i) =>
        `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * (h - 2) - 1}`,
    )
    .join(" ");
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className={up ? "text-accent" : "text-mute"}
    >
      <polyline
        points={pts}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Growth({ g, className = "" }: { g: number; className?: string }) {
  const up = g >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 tabular-nums ${up ? "text-accent" : "text-mute"} ${className}`}
    >
      <Icon className="size-3" strokeWidth={2.4} />
      {formatGrowth(g)}
    </span>
  );
}

export function StageTag({ stage }: { stage: Dish["stage"] }) {
  return (
    <span className="shrink-0 rounded border border-line px-1 text-[10px] leading-[16px] text-ink/60">
      {stage}期
    </span>
  );
}

export function FavButton({ id, className = "" }: { id: string; className?: string }) {
  const { favorites, toggleFavorite } = useStore();
  const on = id in favorites;
  return (
    <button
      aria-label={on ? "取消收藏" : "收藏"}
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(id);
      }}
      className={`grid size-8 shrink-0 place-items-center ${className}`}
    >
      <Star className="size-[17px]" fill={on ? "currentColor" : "none"} strokeWidth={1.7} />
    </button>
  );
}

export function TrendCard({ dish, action }: { dish: Dish; action?: ReactNode }) {
  const { openDish } = useStore();
  return (
    <article
      onClick={() => openDish(dish.id)}
      className="flex cursor-pointer gap-3 rounded-2xl bg-white p-3 transition active:opacity-70"
    >
      <img
        src={dish.image}
        alt={dish.name}
        loading="lazy"
        className="size-[92px] shrink-0 rounded-xl object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start gap-1">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 pt-0.5">
            <h3 className="truncate text-[15px] font-semibold">{dish.name}</h3>
            <StageTag stage={dish.stage} />
          </div>
          <div className="-mr-1.5 -mt-1.5">{action ?? <FavButton id={dish.id} />}</div>
        </div>
        <p className="mt-0.5 truncate text-[12px] text-mute">{dish.intro}</p>
        <p className="mt-1 truncate text-[11.5px] text-ink/70">
          {dish.region} · {dish.city}
          <span className="mx-1.5 text-line">|</span>首发 {dish.origin.platform}{" "}
          {dish.origin.account}
        </p>
        <div className="mt-auto flex items-center gap-2 pt-1.5 text-[11.5px]">
          <Sparkline data={dish.series} up={dish.growth >= 0} w={52} h={16} />
          <Growth g={dish.growth} className="font-medium" />
          <span className="ml-auto text-mute">{formatNum(dish.stores)} 家跟进</span>
        </div>
      </div>
    </article>
  );
}

export function TrendList({ items, action }: { items: Dish[]; action?: (d: Dish) => ReactNode }) {
  return (
    <div className="space-y-2">
      {items.map((d) => (
        <TrendCard key={d.id} dish={d} action={action?.(d)} />
      ))}
    </div>
  );
}

export function Sheet({
  onClose,
  children,
  title,
}: {
  onClose: () => void;
  children: ReactNode;
  title?: string;
}) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="animate-fade absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="animate-sheet no-scrollbar relative max-h-[90%] overflow-y-auto rounded-t-[20px] bg-paper pb-8">
        {title && (
          <div className="sticky top-0 z-10 flex items-center justify-between bg-paper px-5 pb-3 pt-5">
            <h3 className="text-[16px] font-semibold">{title}</h3>
            <button onClick={onClose} aria-label="关闭" className="grid size-8 place-items-center">
              <X className="size-[18px]" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function TrendChart({ data, up }: { data: number[]; up: boolean }) {
  const w = 320;
  const h = 96;
  const min = Math.min(...data) * 0.9;
  const max = Math.max(...data) * 1.05;
  const xy = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - min) / (max - min)) * h]);
  const line = xy.map(([x, y]) => `${x},${y}`).join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h + 2}`}
      className={`h-24 w-full ${up ? "text-accent" : "text-mute"}`}
      preserveAspectRatio="none"
    >
      {[0.25, 0.5, 0.75].map((r) => (
        <line key={r} x1="0" x2={w} y1={h * r} y2={h * r} stroke="#ececec" strokeWidth="1" />
      ))}
      <polygon points={`0,${h} ${line} ${w},${h}`} fill="currentColor" opacity="0.06" />
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-3 rounded-2xl bg-white p-4">
      <h4 className="mb-3 text-[13px] font-semibold">{title}</h4>
      {children}
    </section>
  );
}

export function DetailSheet() {
  const { openId, openDish, favorites, toggleFavorite, followedDishes, toggleFollowDish } =
    useStore();
  const dish = dishes.find((d) => d.id === openId);
  if (!dish) return null;
  const fav = dish.id in favorites;
  const following = followedDishes.includes(dish.id);
  const up = dish.growth >= 0;

  return (
    <Sheet onClose={() => openDish(null)}>
      <div className="relative aspect-[16/9]">
        <img src={dish.image} alt={dish.name} className="size-full object-cover" />
        <button
          onClick={() => openDish(null)}
          aria-label="关闭"
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="px-4 pt-4">
        <div className="px-1">
          <p className="text-[12px] text-mute">
            {dish.category} · {dish.region} · {dish.city}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <h2 className="text-[22px] font-semibold tracking-tight">{dish.name}</h2>
            <StageTag stage={dish.stage} />
          </div>
          <p className="mt-2 text-[13px] leading-[1.7] text-ink/70">{dish.intro}</p>
        </div>

        {dish.update && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-[12.5px]">
            <span className="size-1.5 shrink-0 rounded-full bg-accent" />
            <span className="truncate">{dish.update.text}</span>
            <span className="ml-auto shrink-0 text-[11px] text-mute">{dish.update.time}</span>
          </div>
        )}

        <Block title="热度趋势 · 近 14 日">
          <div className="mb-3 grid grid-cols-3">
            {[
              { l: "热度指数", v: formatNum(dish.heat) },
              { l: "7 日增速", v: <Growth g={dish.growth} /> },
              { l: "跟进门店", v: formatNum(dish.stores) },
            ].map((m, i) => (
              <div key={m.l} className={i ? "border-l border-line pl-3" : ""}>
                <p className="text-[11px] text-mute">{m.l}</p>
                <p className="mt-0.5 text-[18px] font-semibold tabular-nums">{m.v}</p>
              </div>
            ))}
          </div>
          <TrendChart data={dish.series} up={up} />
        </Block>

        <Block title="首发信息">
          <dl className="grid grid-cols-[64px_1fr] gap-y-2 text-[13px]">
            <dt className="text-mute">首发账号</dt>
            <dd>
              {dish.origin.account}
              <span className="ml-1.5 text-[11px] text-mute">{dish.origin.platform}</span>
            </dd>
            <dt className="text-mute">首发门店</dt>
            <dd>{dish.origin.store}</dd>
            <dt className="text-mute">首发时间</dt>
            <dd className="tabular-nums">{dish.origin.date}</dd>
          </dl>
        </Block>

        <Block title="地域分布">
          <ul className="space-y-2">
            {dish.spread.map((s, i) => (
              <li key={s.name} className="flex items-center gap-3 text-[12px]">
                <span className="w-8 shrink-0 text-ink/70">{s.name}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper">
                  <span
                    className={`block h-full rounded-full ${i === 0 ? "bg-ink" : "bg-ink/25"}`}
                    style={{ width: `${s.share}%` }}
                  />
                </span>
                <span className="w-8 shrink-0 text-right tabular-nums text-mute">{s.share}%</span>
              </li>
            ))}
          </ul>
        </Block>

        <Block title="单品信息">
          <dl className="grid grid-cols-[64px_1fr] gap-y-2 text-[13px]">
            <dt className="text-mute">主流售价</dt>
            <dd>{dish.price}</dd>
            <dt className="text-mute">关键要素</dt>
            <dd className="flex flex-wrap gap-1.5">
              {dish.keywords.map((k) => (
                <span key={k} className="rounded bg-paper px-1.5 text-[12px]">
                  {k}
                </span>
              ))}
            </dd>
          </dl>
        </Block>

        <div className="mt-5 flex gap-2.5">
          <button
            onClick={() => toggleFollowDish(dish.id)}
            className={`h-11 flex-1 rounded-xl border text-[14px] transition ${
              following ? "border-accent/40 text-accent" : "border-ink/15 bg-white"
            }`}
          >
            {following ? "已关注动态" : "关注动态"}
          </button>
          <button
            onClick={() => toggleFavorite(dish.id)}
            className="h-11 flex-1 rounded-xl bg-ink text-[14px] text-white"
          >
            {fav ? "已收藏" : "收藏"}
          </button>
        </div>
      </div>
    </Sheet>
  );
}

const tabs = [
  { key: "home", label: "首页", icon: Home },
  { key: "square", label: "广场", icon: Compass },
  { key: "collect", label: "收藏", icon: Bookmark },
  { key: "me", label: "我的", icon: User },
] as const;

export function TabBar({ unread }: { unread: number }) {
  const { tab, setTab } = useStore();
  return (
    <nav className="relative z-30 shrink-0 border-t border-line bg-white pb-5 pt-2">
      <ul className="flex">
        {tabs.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <li key={key} className="flex-1">
              <button
                onClick={() => setTab(key)}
                className={`relative mx-auto flex flex-col items-center gap-1 px-4 py-0.5 text-[10.5px] ${
                  active ? "text-ink" : "text-ink/35"
                }`}
              >
                <Icon className="size-[21px]" strokeWidth={active ? 2 : 1.6} />
                {label}
                {key === "home" && unread > 0 && (
                  <span className="absolute right-3.5 top-0 size-1.5 rounded-full bg-accent" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div className="animate-fade pointer-events-none absolute inset-x-0 top-1/2 z-[60] flex justify-center">
      <span className="rounded-lg bg-ink/85 px-4 py-2.5 text-[13px] text-white">{toast}</span>
    </div>
  );
}
