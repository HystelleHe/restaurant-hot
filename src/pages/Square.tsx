import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { ArrowUp, Search, X } from "lucide-react";
import { Growth, NavBar, TrendList } from "../components";
import { categories, dishes, regions, type Category, type Region } from "../data";
import { useStore } from "../store";

const sorts = ["热度", "增速", "新首发"] as const;

export default function SquarePage({ scrollRef }: { scrollRef: RefObject<HTMLDivElement | null> }) {
  const { query, setQuery, openDish } = useStore();
  const [cat, setCat] = useState<Category>("全部");
  const [region, setRegion] = useState<Region>("全国");
  const [sort, setSort] = useState<(typeof sorts)[number]>("热度");
  const [showTop, setShowTop] = useState(false);
  const rail = useRef<HTMLDivElement>(null);

  // A search term that exactly matches a category or region becomes that filter.
  useEffect(() => {
    if ((categories as readonly string[]).includes(query)) {
      setCat(query as Category);
      setQuery("");
    } else if ((regions as readonly string[]).includes(query)) {
      setRegion(query as Region);
      setQuery("");
    }
  }, [query, setQuery]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setShowTop(el.scrollTop > 480);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    let r = dishes.filter(
      (d) => (cat === "全部" || d.category === cat) && (region === "全国" || d.region === region),
    );
    if (q)
      r = r.filter((d) =>
        [
          d.name,
          d.category,
          d.region,
          d.city,
          d.intro,
          d.origin.account,
          d.origin.store,
          ...d.keywords,
        ].some((s) => s.toLowerCase().includes(q)),
      );
    if (sort === "热度") r = [...r].sort((a, b) => b.heat - a.heat);
    if (sort === "增速") r = [...r].sort((a, b) => b.growth - a.growth);
    if (sort === "新首发") r = [...r].sort((a, b) => b.origin.date.localeCompare(a.origin.date));
    return r;
  }, [cat, region, query, sort]);

  const featured = [...dishes]
    .filter((d) => d.stage === "爆发" || d.stage === "萌芽")
    .sort((a, b) => b.growth - a.growth);
  const searching = query.trim().length > 0;
  const filtered = searching || cat !== "全部" || region !== "全国";

  return (
    <div>
      <NavBar title="广场" />

      <div className="sticky top-0 z-20 bg-paper px-5 pb-1 pt-2">
        <div className="flex h-10 items-center gap-2 rounded-xl bg-white px-3.5">
          <Search className="size-4 shrink-0 text-mute" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="单品、城市、首发账号"
            className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-mute"
          />
          {searching && (
            <button aria-label="清除" onClick={() => setQuery("")} className="text-mute">
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="no-scrollbar -mx-5 mt-2 flex gap-5 overflow-x-auto px-5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`relative shrink-0 py-2 text-[14px] ${cat === c ? "font-semibold text-ink" : "text-ink/45"}`}
            >
              {c}
              {cat === c && (
                <span className="absolute inset-x-1 bottom-0.5 h-[2px] rounded-full bg-ink" />
              )}
            </button>
          ))}
        </div>
      </div>

      {!filtered && (
        <section className="pt-4">
          <div className="mb-2.5 flex items-baseline justify-between px-5">
            <h2 className="text-[15px] font-semibold">正在起量</h2>
            <span className="text-[11.5px] text-mute">萌芽 + 爆发期，按增速</span>
          </div>
          <div
            ref={rail}
            className="no-scrollbar flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pb-1"
          >
            {featured.map((d) => (
              <button
                key={d.id}
                onClick={() => openDish(d.id)}
                className="w-[148px] shrink-0 snap-start overflow-hidden rounded-2xl bg-white text-left"
              >
                <img src={d.image} alt={d.name} className="aspect-[4/3] w-full object-cover" />
                <div className="p-3">
                  <p className="truncate text-[13.5px] font-medium">{d.name}</p>
                  <div className="mt-1 flex items-center justify-between text-[11.5px]">
                    <span className="text-mute">
                      {d.city} · {d.stage}
                    </span>
                    <Growth g={d.growth} className="font-medium" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="flex items-center justify-between px-5 pb-3 pt-6">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`shrink-0 rounded-md px-2 py-1 text-[12px] ${region === r ? "bg-ink text-white" : "text-ink/55"}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-5 pb-3">
        <p className="text-[12.5px] text-mute">
          {searching ? (
            <>
              “<span className="text-ink">{query}</span>” {list.length} 个结果
            </>
          ) : (
            `${list.length} 个单品`
          )}
        </p>
        <div className="flex gap-3 text-[12.5px]">
          {sorts.map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={sort === s ? "font-medium text-ink" : "text-mute"}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-8">
        {list.length ? (
          <TrendList items={list} />
        ) : (
          <div className="py-16 text-center">
            <p className="text-[14px] font-medium">没有匹配的单品</p>
            <p className="mt-1 text-[12px] text-mute">换个关键词，或放宽品类与地域</p>
            <button
              onClick={() => {
                setQuery("");
                setCat("全部");
                setRegion("全国");
              }}
              className="mt-4 rounded-lg border border-ink/15 bg-white px-4 py-2 text-[13px]"
            >
              清除筛选
            </button>
          </div>
        )}
        {list.length > 0 && (
          <p className="pt-5 text-center text-[11px] text-mute">数据每 10 分钟更新</p>
        )}
      </div>

      {showTop && (
        <div className="pointer-events-none sticky bottom-4 z-20 -mt-10 flex justify-end pr-4">
          <button
            aria-label="回到顶部"
            onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
            className="animate-fade pointer-events-auto grid size-10 place-items-center rounded-full border border-line bg-white"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
