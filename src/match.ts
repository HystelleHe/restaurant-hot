import { dishes, type Dish } from "./data";
import type { UserProfile } from "./store";

export const cityRegion: Record<string, Dish["region"]> = {
  上海: "华东",
  杭州: "华东",
  南京: "华东",
  苏州: "华东",
  厦门: "华东",
  合肥: "华东",
  广州: "华南",
  深圳: "华南",
  东莞: "华南",
  南宁: "华南",
  北京: "华北",
  天津: "华北",
  青岛: "华北",
  郑州: "华北",
  成都: "西南",
  重庆: "西南",
  昆明: "西南",
  贵阳: "西南",
  武汉: "华中",
  长沙: "华中",
  南昌: "华中",
};

const priceBand: Record<string, [number, number]> = {
  "15 元以下": [0, 15],
  "15–30 元": [15, 30],
  "30–60 元": [30, 60],
  "60–100 元": [60, 100],
  "100 元以上": [100, 999],
};

const firstNum = (s: string) => Number(s.match(/\d+/)?.[0] ?? 0);

export interface Match {
  dish: Dish;
  score: number;
  reasons: string[];
}

// Rank trends by relevance to the owner's business profile.
export function matchTrends(p: UserProfile, limit = 4): Match[] {
  const region = cityRegion[p.city];
  const band = priceBand[p.price];
  return dishes
    .map((d) => {
      const reasons: string[] = [];
      let score = 0;
      if (p.types.includes(d.category)) {
        score += 4;
        reasons.push(`同品类 ${d.category}`);
      }
      if (d.city === p.city) {
        score += 3;
        reasons.push(`同城首发`);
      } else if (region && d.region === region) {
        score += 2;
        reasons.push(`${region}起量`);
      }
      const price = firstNum(d.price);
      if (band && price >= band[0] && price <= band[1]) {
        score += 1;
        reasons.push("价格带匹配");
      }
      if (d.stage === "萌芽" || d.stage === "爆发") {
        score += p.goals.includes("找新品") ? 2 : 1;
        reasons.push(`${d.stage}期`);
      }
      if (
        p.channels.includes("外卖") &&
        d.keywords.some((k) => k.includes("盒装") || k.includes("热量"))
      ) {
        score += 1;
        reasons.push("适合外卖");
      }
      if (p.accounts?.[d.origin.platform as "小红书" | "抖音"]) {
        score += 1;
        reasons.push(`${d.origin.platform}起量`);
      }
      return { dish: d, score: score + d.growth / 100, reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
