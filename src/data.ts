const u = (id: string) =>
  `https://images.unsplash.com/${id}?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=800`;

export const categories = [
  "全部",
  "茶饮",
  "咖啡",
  "烘焙",
  "甜品",
  "小吃快餐",
  "正餐",
  "火锅",
  "轻食",
] as const;
export type Category = (typeof categories)[number];

export const regions = ["全国", "华东", "华南", "华北", "西南", "华中"] as const;
export type Region = (typeof regions)[number];

export type Stage = "萌芽" | "爆发" | "成熟" | "回落";
export type Platform = "小红书" | "抖音" | "大众点评";

export interface Dish {
  id: string;
  name: string;
  category: Exclude<Category, "全部">;
  region: Exclude<Region, "全国">;
  city: string;
  image: string;
  intro: string;
  stage: Stage;
  heat: number; // 热度指数
  growth: number; // 近 7 日增速 %
  stores: number; // 跟进门店数
  price: string; // 主流售价带
  keywords: string[];
  origin: { account: string; platform: Platform; store: string; date: string };
  spread: { name: string; share: number }[];
  series: number[]; // 近 14 日热度
  update?: { text: string; time: string };
}

// Deterministic 14-day series shaped by lifecycle stage.
function series(stage: Stage, seed: number): number[] {
  return Array.from({ length: 14 }, (_, i) => {
    const t = i / 13;
    const base =
      stage === "萌芽"
        ? 18 + 70 * t ** 2.2
        : stage === "爆发"
          ? 25 + 70 * t ** 1.2
          : stage === "成熟"
            ? 72 + 10 * Math.sin(t * 3)
            : 85 - 45 * t;
    return Math.round(base + Math.sin(i * 1.7 + seed) * 4);
  });
}

const raw: Omit<Dish, "series">[] = [
  {
    id: "d1",
    name: "冷萃抹茶云顶",
    category: "茶饮",
    region: "华东",
    city: "杭州",
    image: u("photo-1749280447307-31a68eb38673"),
    intro: "冷萃抹茶叠加海盐奶盖，抹茶从单品升级为“茶底 + 云顶”结构，出杯快、视觉辨识度高。",
    stage: "爆发",
    heat: 9820,
    growth: 38,
    stores: 1260,
    price: "18–24 元",
    keywords: ["宇治抹茶", "海盐奶盖", "低糖"],
    origin: {
      account: "@一叶茶事",
      platform: "小红书",
      store: "一叶茶事·湖滨店",
      date: "2025-05-12",
    },
    spread: [
      { name: "华东", share: 46 },
      { name: "华南", share: 22 },
      { name: "西南", share: 14 },
      { name: "华北", share: 10 },
      { name: "其他", share: 8 },
    ],
    update: { text: "近 7 日热度 +38%，新增 126 家门店跟进", time: "12 分钟前" },
  },
  {
    id: "d2",
    name: "开心果可颂",
    category: "烘焙",
    region: "华东",
    city: "上海",
    image: u("photo-1555507036-ab1f4038808a"),
    intro: "开心果酱内馅 + 碎粒外裹，客单价可上探至 30 元以上，社交平台晒单率高。",
    stage: "爆发",
    heat: 8640,
    growth: 52,
    stores: 840,
    price: "22–32 元",
    keywords: ["开心果酱", "发酵黄油", "限量出炉"],
    origin: {
      account: "@Maison麦",
      platform: "小红书",
      store: "Maison 麦·安福路",
      date: "2025-04-28",
    },
    spread: [
      { name: "华东", share: 58 },
      { name: "华北", share: 16 },
      { name: "西南", share: 12 },
      { name: "华南", share: 9 },
      { name: "其他", share: 5 },
    ],
    update: { text: "首次进入成都、杭州同城热榜", time: "1 小时前" },
  },
  {
    id: "d3",
    name: "番茄牛腩锅",
    category: "火锅",
    region: "西南",
    city: "成都",
    image: u("photo-1614104030967-5ca61a54247b"),
    intro: "不辣锅底在川渝市场逆势起量，覆盖带娃家庭和不吃辣人群，适合作为第二锅底。",
    stage: "萌芽",
    heat: 5260,
    growth: 71,
    stores: 310,
    price: "68–98 元/锅",
    keywords: ["整颗番茄", "清远牛腩", "不辣"],
    origin: {
      account: "@沸点火锅",
      platform: "抖音",
      store: "沸点火锅·玉林店",
      date: "2025-06-03",
    },
    spread: [
      { name: "西南", share: 62 },
      { name: "华中", share: 15 },
      { name: "华东", share: 11 },
      { name: "华南", share: 7 },
      { name: "其他", share: 5 },
    ],
    update: { text: "抖音相关话题播放量突破 2 亿", time: "3 小时前" },
  },
  {
    id: "d4",
    name: "黑松露和牛堡",
    category: "小吃快餐",
    region: "华东",
    city: "上海",
    image: u("photo-1651993841930-946a700c1524"),
    intro: "高端汉堡标准化进入商场档口，以和牛 + 黑松露做价格锚点，带动套餐客单。",
    stage: "成熟",
    heat: 7710,
    growth: 6,
    stores: 2140,
    price: "48–68 元",
    keywords: ["M5 和牛", "黑松露酱", "布里欧修"],
    origin: {
      account: "@GRILL27",
      platform: "大众点评",
      store: "GRILL 27·静安嘉里",
      date: "2024-11-20",
    },
    spread: [
      { name: "华东", share: 38 },
      { name: "华北", share: 24 },
      { name: "华南", share: 20 },
      { name: "西南", share: 11 },
      { name: "其他", share: 7 },
    ],
    update: { text: "跟进门店增速放缓，同质化程度升高", time: "昨天" },
  },
  {
    id: "d5",
    name: "莓果提拉米苏",
    category: "甜品",
    region: "华北",
    city: "北京",
    image: u("photo-1698688334089-c68105801d02"),
    intro: "经典提拉米苏加入当季莓果，盒装形态适合外卖和自提，节日节点表现突出。",
    stage: "爆发",
    heat: 4870,
    growth: 29,
    stores: 520,
    price: "28–38 元",
    keywords: ["马斯卡彭", "当季草莓", "盒装"],
    origin: {
      account: "@Dolce九号",
      platform: "小红书",
      store: "Dolce 九号·三里屯",
      date: "2025-05-20",
    },
    spread: [
      { name: "华北", share: 44 },
      { name: "华东", share: 28 },
      { name: "华南", share: 13 },
      { name: "西南", share: 9 },
      { name: "其他", share: 6 },
    ],
  },
  {
    id: "d6",
    name: "三文鱼波奇碗",
    category: "轻食",
    region: "华南",
    city: "深圳",
    image: u("photo-1546069901-ba9599a7e63c"),
    intro: "白领午市高频复购，标注热量与蛋白质含量成为标配，外卖占比超过六成。",
    stage: "萌芽",
    heat: 4120,
    growth: 44,
    stores: 290,
    price: "38–52 元",
    keywords: ["高蛋白", "藜麦", "热量标注"],
    origin: {
      account: "@GreenLab",
      platform: "抖音",
      store: "Green Lab·科技园",
      date: "2025-06-10",
    },
    spread: [
      { name: "华南", share: 51 },
      { name: "华东", share: 27 },
      { name: "华北", share: 12 },
      { name: "西南", share: 6 },
      { name: "其他", share: 4 },
    ],
  },
  {
    id: "d7",
    name: "十二小时豚骨拉面",
    category: "正餐",
    region: "华南",
    city: "广州",
    image: u("photo-1526318896980-cf78c088247c"),
    intro: "长时熬汤作为卖点，夜宵时段贡献近四成营收，对后厨产能要求较高。",
    stage: "成熟",
    heat: 6950,
    growth: -4,
    stores: 1730,
    price: "38–48 元",
    keywords: ["豚骨汤", "溏心蛋", "夜宵"],
    origin: {
      account: "@麺屋一灯",
      platform: "大众点评",
      store: "麺屋一灯·天河",
      date: "2024-09-02",
    },
    spread: [
      { name: "华南", share: 34 },
      { name: "华东", share: 30 },
      { name: "华北", share: 18 },
      { name: "西南", share: 11 },
      { name: "其他", share: 7 },
    ],
  },
  {
    id: "d8",
    name: "手打柠檬茶",
    category: "茶饮",
    region: "华南",
    city: "湛江",
    image: u("photo-1556679343-c7306c1976bc"),
    intro: "赛道已高度饱和，新进入者需在茶底或地域水果上做差异化，价格战明显。",
    stage: "回落",
    heat: 5980,
    growth: -12,
    stores: 6820,
    price: "12–18 元",
    keywords: ["香水柠檬", "鸭屎香", "暴打"],
    origin: {
      account: "@柠季研究所",
      platform: "抖音",
      store: "柠季研究所·赤坎",
      date: "2023-04-15",
    },
    spread: [
      { name: "华南", share: 36 },
      { name: "华中", share: 22 },
      { name: "华东", share: 20 },
      { name: "西南", share: 14 },
      { name: "其他", share: 8 },
    ],
  },
  {
    id: "d9",
    name: "海盐焦糖拿铁",
    category: "咖啡",
    region: "华东",
    city: "厦门",
    image: u("photo-1536256263959-770b48d82b0a"),
    intro: "季节限定款，秋冬回暖，可作为常规菜单的季节性补充，不建议作为主推。",
    stage: "回落",
    heat: 3950,
    growth: -8,
    stores: 1980,
    price: "22–30 元",
    keywords: ["自熬焦糖", "盖朗德海盐", "季节限定"],
    origin: {
      account: "@SlowBean",
      platform: "小红书",
      store: "Slow Bean·沙坡尾",
      date: "2024-10-08",
    },
    spread: [
      { name: "华东", share: 40 },
      { name: "华南", share: 24 },
      { name: "华北", share: 18 },
      { name: "西南", share: 11 },
      { name: "其他", share: 7 },
    ],
  },
  {
    id: "d10",
    name: "薄荷青柠气泡",
    category: "茶饮",
    region: "西南",
    city: "昆明",
    image: u("photo-1555949366-819808d99159"),
    intro: "云南鲜薄荷产地直采，0 脂气泡定位切入夏季清爽需求，原料成本低。",
    stage: "萌芽",
    heat: 3380,
    growth: 18,
    stores: 170,
    price: "15–19 元",
    keywords: ["鲜薄荷", "0 脂", "气泡"],
    origin: {
      account: "@一叶茶事",
      platform: "小红书",
      store: "一叶茶事·翠湖店",
      date: "2025-06-18",
    },
    spread: [
      { name: "西南", share: 48 },
      { name: "华南", share: 21 },
      { name: "华东", share: 17 },
      { name: "华中", share: 8 },
      { name: "其他", share: 6 },
    ],
  },
];

export const dishes: Dish[] = raw.map((d, i) => ({ ...d, series: series(d.stage, i) }));

export interface Topic {
  id: string;
  title: string;
  desc: string;
  posts: number;
  hot?: boolean;
}

export const topics: Topic[] = [
  {
    id: "t1",
    title: "茶饮下半年新品方向",
    desc: "抹茶、地域水果、轻乳茶谁会接棒",
    posts: 12800,
    hot: true,
  },
  {
    id: "t2",
    title: "县城餐饮还值得做吗",
    desc: "租金、客群与复购的真实账本",
    posts: 8640,
    hot: true,
  },
  { id: "t3", title: "小份菜与一人食", desc: "如何拆分 SKU 不降低客单", posts: 5210 },
  { id: "t4", title: "门店成本控制实战", desc: "食材损耗、人效与能耗", posts: 4370 },
  { id: "t5", title: "抖音团购怎么做才赚钱", desc: "套餐设计与核销率", posts: 3980 },
  { id: "t6", title: "夜宵档口选品", desc: "22 点后的高毛利单品", posts: 2160 },
];

export const hotSearches = ["抹茶", "开心果", "番茄锅", "波奇碗", "提拉米苏"];

export const formatNum = (n: number) =>
  n >= 10000 ? `${(n / 10000).toFixed(1)}w` : n.toLocaleString();
export const formatGrowth = (g: number) => `${g > 0 ? "+" : ""}${g}%`;
