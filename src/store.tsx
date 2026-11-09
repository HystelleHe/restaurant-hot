import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export interface Folder {
  id: string;
  name: string;
}

export interface UserProfile {
  avatar?: string;
  name: string;
  role: string;
  phone: string;
  brand: string;
  city: string;
  types: string[];
  mode: string;
  scale: string;
  area: string;
  price: string;
  customers: string[];
  channels: string[];
  goals: string[];
  accounts?: { 小红书?: string; 抖音?: string };
  analyzedAt?: string;
}

export interface LedgerEntry {
  id: string;
  title: string;
  delta: number;
  date: string;
}

export type CollectSeg = "fav" | "follow" | "topic";

interface Persisted {
  ledger: LedgerEntry[];
  profile: UserProfile;
  favorites: Record<string, string>;
  folders: Folder[];
  followedTopics: string[];
  followedDishes: string[];
  readUpdates: string[];
  points: number;
  checkIns: string[];
}

const defaults: Persisted = {
  profile: {
    name: "王建国",
    role: "老板 / 创始人",
    phone: "",
    brand: "柒号茶铺",
    city: "杭州",
    types: ["茶饮"],
    mode: "直营",
    scale: "2–5 家",
    area: "",
    price: "15–30 元",
    customers: [],
    channels: [],
    goals: [],
  },
  favorites: { d1: "f1", d2: "f1", d3: "f2", d5: "f0" },
  folders: [
    { id: "f0", name: "默认" },
    { id: "f1", name: "新品参考" },
    { id: "f2", name: "竞品观察" },
  ],
  followedTopics: ["t1", "t3"],
  followedDishes: ["d1", "d2", "d3", "d4"],
  readUpdates: [],
  points: 1280,
  ledger: [
    { id: "l4", title: "兑换 品类月度热点报告", delta: -300, date: "2025-06-20" },
    { id: "l3", title: "提交意见反馈", delta: 20, date: "2025-06-18" },
    { id: "l2", title: "连续签到 30 天奖励", delta: 300, date: "2025-06-12" },
    { id: "l1", title: "新用户注册礼", delta: 1260, date: "2025-05-10" },
  ],
  checkIns: [],
};

const KEY = "reppin-state-v2";
export const today = () => new Date().toISOString().slice(0, 10);
const entry = (title: string, delta: number): LedgerEntry => ({
  id: `l${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
  title,
  delta,
  date: today(),
});

type Tab = "home" | "square" | "collect" | "me";

export type PicksTab = "rising" | "emerging" | "updates";

interface Store extends Persisted {
  tab: Tab;
  setTab: (t: Tab) => void;
  query: string;
  setQuery: (q: string) => void;
  openId: string | null;
  picks: PicksTab | null;
  openPicks: (t: PicksTab | null) => void;
  openDish: (id: string | null) => void;
  toggleFavorite: (id: string, folderId?: string) => void;
  moveToFolder: (id: string, folderId: string) => void;
  addFolder: (name: string) => string;
  removeFolder: (id: string) => void;
  toggleTopic: (id: string) => void;
  toggleFollowDish: (id: string) => void;
  markRead: (id: string) => void;
  checkIn: () => void;
  addPoints: (n: number, title: string) => void;
  spendPoints: (n: number, title: string) => boolean;
  collectSeg: CollectSeg;
  setCollectSeg: (s: CollectSeg) => void;
  pointsOpen: boolean;
  feedbackOpen: boolean;
  setFeedbackOpen: (v: boolean) => void;
  setPointsOpen: (v: boolean) => void;
  toast: string | null;
  showToast: (msg: string) => void;
  setProfile: (p: UserProfile) => void;
  editingProfile: boolean;
  setEditingProfile: (v: boolean) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Persisted>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
    } catch {
      return defaults;
    }
  });
  const [tab, setTab] = useState<Tab>("home");
  const [query, setQuery] = useState("");
  const [openId, openDish] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [collectSeg, setCollectSeg] = useState<CollectSeg>("fav");
  const [pointsOpen, setPointsOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [picks, openPicks] = useState<PicksTab | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(data));
  }, [data]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 1800);
  }, []);

  const toggle = (arr: string[], id: string) =>
    arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];

  const store: Store = {
    ...data,
    tab,
    setTab,
    query,
    setQuery,
    openId,
    picks,
    editingProfile,
    collectSeg,
    setCollectSeg,
    pointsOpen,
    feedbackOpen,
    setFeedbackOpen,
    setPointsOpen,
    setEditingProfile,
    openPicks,
    openDish,
    toast,
    showToast,
    setProfile: (profile) => setData((d) => ({ ...d, profile })),
    toggleFavorite: (id, folderId = "f0") => {
      const has = id in data.favorites;
      setData((d) => {
        const favorites = { ...d.favorites };
        if (id in favorites) delete favorites[id];
        else favorites[id] = folderId;
        return { ...d, favorites };
      });
      showToast(has ? "已取消收藏" : "已收藏到「默认」");
    },
    moveToFolder: (id, folderId) =>
      setData((d) => ({ ...d, favorites: { ...d.favorites, [id]: folderId } })),
    addFolder: (name) => {
      const id = `f${Date.now()}`;
      setData((d) => ({ ...d, folders: [...d.folders, { id, name }] }));
      return id;
    },
    removeFolder: (id) =>
      setData((d) => ({
        ...d,
        folders: d.folders.filter((f) => f.id !== id),
        favorites: Object.fromEntries(
          Object.entries(d.favorites).map(([k, v]) => [k, v === id ? "f0" : v]),
        ),
      })),
    toggleTopic: (id) => setData((d) => ({ ...d, followedTopics: toggle(d.followedTopics, id) })),
    toggleFollowDish: (id) => {
      const has = data.followedDishes.includes(id);
      setData((d) => ({ ...d, followedDishes: toggle(d.followedDishes, id) }));
      showToast(has ? "已取消关注" : "已关注，有新动态会提醒你");
    },
    markRead: (id) =>
      setData((d) =>
        d.readUpdates.includes(id) ? d : { ...d, readUpdates: [...d.readUpdates, id] },
      ),
    checkIn: () => {
      if (data.checkIns.includes(today())) return;
      setData((d) => ({
        ...d,
        points: d.points + 10,
        checkIns: [...d.checkIns, today()],
        ledger: [entry("每日签到", 10), ...d.ledger],
      }));
      showToast("签到成功 +10 积分");
    },
    addPoints: (n, title) =>
      setData((d) => ({ ...d, points: d.points + n, ledger: [entry(title, n), ...d.ledger] })),
    spendPoints: (n, title) => {
      if (data.points < n) return false;
      setData((d) => ({ ...d, points: d.points - n, ledger: [entry(title, -n), ...d.ledger] }));
      return true;
    },
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("StoreProvider missing");
  return s;
}
