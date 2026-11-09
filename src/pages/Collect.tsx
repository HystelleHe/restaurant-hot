import { useState } from "react";
import { Check, FolderInput, Plus } from "lucide-react";
import { Growth, NavBar, Sheet, TrendList } from "../components";
import { dishes, formatNum, topics } from "../data";
import { useStore } from "../store";

const segs = [
  { key: "fav", label: "收藏单品" },
  { key: "follow", label: "关注单品" },
  { key: "topic", label: "行业话题" },
] as const;

export default function CollectPage() {
  const {
    favorites,
    followedTopics,
    followedDishes,
    collectSeg: seg,
    setCollectSeg: setSeg,
  } = useStore();
  const counts = {
    fav: Object.keys(favorites).length,
    follow: followedDishes.length,
    topic: followedTopics.length,
  };

  return (
    <div>
      <NavBar title="收藏" />
      <div className="flex gap-6 border-b border-line px-5 pt-2">
        {segs.map((s) => (
          <button
            key={s.key}
            onClick={() => setSeg(s.key)}
            className={`relative pb-2.5 text-[14px] ${seg === s.key ? "font-semibold" : "text-ink/45"}`}
          >
            {s.label}
            <span className="ml-1 text-[11px] font-normal text-mute">{counts[s.key]}</span>
            {seg === s.key && <span className="absolute inset-x-0 -bottom-px h-[2px] bg-ink" />}
          </button>
        ))}
      </div>
      {seg === "fav" && <Favorites />}
      {seg === "follow" && <Following />}
      {seg === "topic" && <Topics />}
    </div>
  );
}

function Favorites() {
  const { favorites, folders, addFolder, removeFolder, moveToFolder, showToast } = useStore();
  const [active, setActive] = useState("all");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [moving, setMoving] = useState<string | null>(null);

  const favDishes = dishes.filter((d) => d.id in favorites);
  const count = (fid: string) => favDishes.filter((d) => favorites[d.id] === fid).length;
  const shown = active === "all" ? favDishes : favDishes.filter((d) => favorites[d.id] === active);
  const activeFolder = folders.find((f) => f.id === active);

  return (
    <div>
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-5 py-4">
        {[{ id: "all", name: "全部" }, ...folders].map((f) => (
          <button
            key={f.id}
            onClick={() => setActive(f.id)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-[13px] ${
              active === f.id ? "bg-ink text-white" : "bg-white text-ink/70"
            }`}
          >
            {f.name}
            <span
              className={`ml-1.5 text-[11px] ${active === f.id ? "text-white/50" : "text-mute"}`}
            >
              {f.id === "all" ? favDishes.length : count(f.id)}
            </span>
          </button>
        ))}
        <button
          onClick={() => setCreating(true)}
          aria-label="新建文件夹"
          className="grid size-8 shrink-0 place-items-center rounded-lg border border-dashed border-ink/20 text-mute"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {activeFolder && activeFolder.id !== "f0" && (
        <div className="-mt-1 flex justify-end px-5 pb-2">
          <button
            onClick={() => {
              removeFolder(activeFolder.id);
              setActive("all");
              showToast("文件夹已删除，单品移至「默认」");
            }}
            className="text-[12px] text-mute"
          >
            删除此文件夹
          </button>
        </div>
      )}

      <div className="px-4 pb-8">
        {shown.length ? (
          <TrendList
            items={shown}
            action={(d) => (
              <button
                aria-label="移动到文件夹"
                onClick={(e) => {
                  e.stopPropagation();
                  setMoving(d.id);
                }}
                className="flex h-8 items-center gap-1 px-1.5 text-[11px] text-mute"
              >
                <FolderInput className="size-3.5" />
                {folders.find((f) => f.id === favorites[d.id])?.name ?? "默认"}
              </button>
            )}
          />
        ) : (
          <p className="rounded-2xl bg-white py-12 text-center text-[13px] text-mute">
            这个文件夹还是空的
          </p>
        )}
      </div>

      {creating && (
        <Sheet title="新建文件夹" onClose={() => setCreating(false)}>
          <form
            className="px-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              setActive(addFolder(name.trim()));
              setName("");
              setCreating(false);
              showToast("文件夹已创建");
            }}
          >
            <input
              autoFocus
              maxLength={10}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：秋冬菜单、对标品牌"
              className="h-12 w-full rounded-xl bg-white px-4 text-[15px] outline-none"
            />
            <button
              disabled={!name.trim()}
              className="mt-4 h-11 w-full rounded-xl bg-ink text-[14px] text-white disabled:opacity-30"
            >
              创建
            </button>
          </form>
        </Sheet>
      )}

      {moving && (
        <Sheet title="移动到" onClose={() => setMoving(null)}>
          <ul className="mx-5 rounded-2xl bg-white">
            {folders.map((f) => (
              <li key={f.id} className="border-b border-line last:border-0">
                <button
                  onClick={() => {
                    moveToFolder(moving, f.id);
                    setMoving(null);
                    showToast(`已移动到「${f.name}」`);
                  }}
                  className="flex w-full items-center justify-between px-4 py-3.5 text-[14px]"
                >
                  {f.name}
                  {favorites[moving] === f.id && <Check className="size-4" />}
                </button>
              </li>
            ))}
          </ul>
        </Sheet>
      )}
    </div>
  );
}

function Following() {
  const { followedDishes, toggleFollowDish, openDish } = useStore();
  const list = dishes.filter((d) => followedDishes.includes(d.id));
  if (!list.length)
    return (
      <p className="px-8 py-16 text-center text-[13px] leading-relaxed text-mute">
        在单品详情中点击“关注动态”，热度异动、新城市起量会第一时间提醒你
      </p>
    );
  return (
    <ul className="mx-4 mt-4 rounded-2xl bg-white">
      {list.map((d) => (
        <li key={d.id} className="border-b border-line last:border-0">
          <div
            onClick={() => openDish(d.id)}
            className="flex cursor-pointer items-center gap-3 px-4 py-3.5"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-[14px] font-medium">{d.name}</span>
                <Growth g={d.growth} className="text-[12px]" />
              </div>
              <p className="mt-0.5 truncate text-[12px] text-mute">
                {d.update ? d.update.text : "暂无新动态"}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFollowDish(d.id);
              }}
              className="shrink-0 rounded-md border border-line px-2.5 py-1 text-[12px] text-mute"
            >
              取消关注
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Topics() {
  const { followedTopics, toggleTopic } = useStore();
  const mine = topics.filter((t) => followedTopics.includes(t.id));
  const rec = topics.filter((t) => !followedTopics.includes(t.id));

  const Row = ({ t }: { t: (typeof topics)[number] }) => {
    const on = followedTopics.includes(t.id);
    return (
      <li className="border-b border-line last:border-0">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-[14px] font-medium">
              # {t.title}
              {t.hot && <span className="text-[10.5px] font-normal text-accent">热议</span>}
            </p>
            <p className="mt-0.5 truncate text-[12px] text-mute">
              {t.desc} · {formatNum(t.posts)} 讨论
            </p>
          </div>
          <button
            onClick={() => toggleTopic(t.id)}
            className={`shrink-0 rounded-md px-2.5 py-1 text-[12px] ${
              on ? "border border-line text-mute" : "bg-ink text-white"
            }`}
          >
            {on ? "已关注" : "关注"}
          </button>
        </div>
      </li>
    );
  };

  return (
    <div className="px-4 pb-8 pt-4">
      {mine.length > 0 && (
        <ul className="rounded-2xl bg-white">
          {mine.map((t) => (
            <Row key={t.id} t={t} />
          ))}
        </ul>
      )}
      {rec.length > 0 && (
        <>
          <p className="px-1 pb-2 pt-5 text-[12px] text-mute">推荐话题</p>
          <ul className="rounded-2xl bg-white">
            {rec.map((t) => (
              <Row key={t.id} t={t} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
