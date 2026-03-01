import type { CalcResult, DiscountTier, FareClass, TdxODFare } from "./types";

export const TPASS_PRICE = 1200;

export const DISCOUNT_TIERS: DiscountTier[] = [
  { min: 0, max: 10, rate: 0.0, label: "原價（無回饋）", pct: "0%" },
  { min: 11, max: 20, rate: 0.05, label: "95 折（5% 回饋）", pct: "5%" },
  { min: 21, max: 40, rate: 0.1, label: "9 折（10% 回饋）", pct: "10%" },
  {
    min: 41,
    max: Infinity,
    rate: 0.15,
    label: "85 折（15% 回饋）",
    pct: "15%",
  },
];

export function getTier(n: number): DiscountTier {
  return DISCOUNT_TIERS.find((t) => n >= t.min && n <= t.max)!;
}

/**
 * 核心計算
 * @param fare        單程票價（Mock = MOCK_BASE × fareClass 倍率；接 API 後為真實票價）
 * @param days        該月通勤天數
 * @param tripsPerDay 每天搭乘次數（去回各算一次，預設 2）
 */
export function calcFare(
  fare: number,
  days: number,
  tripsPerDay: number,
): CalcResult {
  const N = days * tripsPerDay;
  const tier = getTier(N);
  const fullCost = fare * N;
  const easycardCost = Math.round(fullCost * (1 - tier.rate));
  const rebate = fullCost - easycardCost;
  const savings = easycardCost - TPASS_PRICE;

  return {
    N,
    tier,
    fullCost,
    easycardCost,
    rebate,
    savings,
    tpassWins: savings > 0,
  };
}

/**
 * 從 TDX ODFare 資料中查詢站對站票價
 * TicketType 1 = 一般票（作為悠遊卡常客優惠的計算基準）
 */
export function lookupFare(
  odFares: TdxODFare[],
  fromId: string,
  toId: string,
  fareClass: FareClass = 1,
): number | null {
  const od = odFares.find(
    (f) => f.OriginStationID === fromId && f.DestinationStationID === toId,
  );
  if (!od) return null;

  const fare = od.Fares.find(
    (f) => f.TicketType === 1 && f.FareClass === fareClass,
  );
  return fare?.Price ?? null;
}
