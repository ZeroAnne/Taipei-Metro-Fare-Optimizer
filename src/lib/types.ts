export type Station = {
  id: string;
  name: string;
  line: string;
};

export type DiscountTier = {
  min: number;
  max: number;
  rate: number;
  label: string;
  pct: string;
};

export type CalcResult = {
  N: number;
  tier: DiscountTier;
  fullCost: number;
  easycardCost: number;
  /** 常客優惠回饋金額（fullCost - easycardCost） */
  rebate: number;
  /** 正數 = 悠遊卡比 TPASS 貴 → 辦 TPASS 省錢；負數 = TPASS 比悠遊卡貴 → 繼續刷卡 */
  savings: number;
  tpassWins: boolean;
};

// ── 乘客票種 (FareClass) ────────────────────────────────────────────────
// 對應 TDX ODFare Fares[].FareClass
// 1:成人 2:學生 3:孩童 4:敬老 5:愛心 6:愛心孩童
export type FareClass = 1 | 2 | 3 | 4 | 5;

export const FARE_CLASS_OPTIONS: {
  value: FareClass;
  label: string;
  desc: string;
}[] = [
  { value: 1, label: "成人", desc: "Adult" },
  { value: 2, label: "學生", desc: "Student" },
  { value: 3, label: "孩童", desc: "Child" },
  { value: 4, label: "敬老", desc: "Senior" },
  { value: 5, label: "愛心", desc: "Disabled" },
];

// ── TDX ODFare API 型別定義 ──────────────────────────────────────────────
export type TdxFare = {
  TicketType: number; // 1:一般票 2:來回票(悠遊卡) 3:電子票證 4:回數票 5:定期票30日 6:定期票60日
  FareClass: number; // 1:成人 2:學生 3:孩童 4:敬老 5:愛心 ...
  SaleType?: string;
  CitizenCode?: string;
  Price: number;
};

export type TdxODFare = {
  OriginStationID: string;
  OriginStationName: { Zh_tw: string; En: string };
  DestinationStationID: string;
  DestinationStationName: { Zh_tw: string; En: string };
  TrainType?: number;
  Fares: TdxFare[];
  TravelTime?: number;
  TravelDistance?: number;
};
