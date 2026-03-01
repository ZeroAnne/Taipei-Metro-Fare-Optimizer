/**
 * TDX 運輸資料流通服務 API
 * 申請帳號：https://tdx.transportdata.tw/
 *
 */

import type { TdxODFare } from "./types";

// 從環境變數讀取（.env.local），勿將真實憑證寫入程式碼或提交至 git
const CLIENT_ID: string = process.env.NEXT_PUBLIC_TDX_CLIENT_ID ?? "";
const CLIENT_SECRET: string = process.env.NEXT_PUBLIC_TDX_CLIENT_SECRET ?? "";

/** 是否已填入 API 憑證 */
export function hasCredentials(): boolean {
  return CLIENT_ID !== "" && CLIENT_SECRET !== "";
}

const TOKEN_URL =
  "https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token";
const BASE_URL = "https://tdx.transportdata.tw/api/basic";
const CACHE_KEY = "metro_fare_pro_fares";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 小時

let cachedToken: { value: string; expiresAt: number } | null = null;

// ── Token ─────────────────────────────────────────────────────────────────

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  if (!res.ok) throw new Error(`TDX Token 取得失敗: ${res.status}`);

  const data = await res.json();
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.value;
}

// ── 車站清單 ───────────────────────────────────────────────────────────────

/**
 * 取得台北捷運所有車站
 * API: GET /v2/Rail/Metro/Station/TRTC
 *
 * 回傳欄位重點：
 *   StationID   → 對應我們的 Station.id (e.g. "BL18")
 *   StationName.Zh_tw → 中文站名
 *   LineID      → 路線代碼 (BL / R / G / O / BR)
 */
export async function fetchStations() {
  const token = await getToken();
  const res = await fetch(
    `${BASE_URL}/v2/Rail/Metro/Station/TRTC?$format=JSON`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`fetchStations 失敗: ${res.status}`);
  return res.json();
}

// ── 票價資料 ───────────────────────────────────────────────────────────────

/**
 * 取得所有起迄站票價
 * API: GET /v2/Rail/Metro/ODFare/TRTC
 *
 * OData 查詢參數說明：
 *   $select  → 只取需要的欄位，大幅減少傳輸量
 *   $top     → 預設只回 30 筆！TRTC 全部約 17,000+ 筆，需指定足夠大的數字
 *   $filter  → 可篩選特定站，但我們需要全部，所以不用
 *   $orderby → 排序（不需要）
 *   $skip    → 分頁跳過（搭配 $top 分頁用）
 *
 * 票種查詢建議：
 *   TicketType = 1 (一般票) 作為悠遊卡常客優惠計算基準
 *   FareClass  = 1 (成人) / 2 (學生) / 3 (孩童) / 4 (敬老) / 5 (愛心)
 */
export async function fetchFares(): Promise<TdxODFare[]> {
  const token = await getToken();

  // $select：只取計算需要的欄位，省略 TravelTime / TravelDistance / TrainType
  // $top=30000：TRTC 站對站組合約 131×130 ≈ 17,000 筆，設定足夠大避免被截斷
  const params = new URLSearchParams({
    $select: "OriginStationID,DestinationStationID,Fares",
    $top: "30000",
    $format: "JSON",
  });

  const res = await fetch(`${BASE_URL}/v2/Rail/Metro/ODFare/TRTC?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`fetchFares 失敗: ${res.status}`);
  return res.json();
}

/** 清除票價 cache，下次呼叫 fetchAndCacheFares 時會重新從 API 拉 */
export function clearFareCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // localStorage 不可用時跳過
  }
}

/**
 * 取得票價並寫入 localStorage cache
 * 建議在 app 初始化時呼叫一次
 */
export async function fetchAndCacheFares(): Promise<TdxODFare[]> {
  // 檢查 cache 是否還有效
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, cachedAt } = JSON.parse(cached);
      if (Date.now() - cachedAt < CACHE_TTL) {
        return data as TdxODFare[];
      }
    }
  } catch {
    // localStorage 不可用時跳過
  }

  const fares = await fetchFares();

  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data: fares, cachedAt: Date.now() }),
    );
  } catch {
    // 超過 storage 限制時跳過
  }

  return fares;
}

/**
 * 從快取的票價資料中查詢站對站票價
 *
 * @param odFares   fetchAndCacheFares() 的回傳資料
 * @param fromId    起站 ID (e.g. "BL18")
 * @param toId      終站 ID (e.g. "R08")
 * @param fareClass 票種 1=成人 2=學生 3=孩童 4=敬老 5=愛心
 * @param ticketType 票種類型，預設 1=一般票（作為常客優惠計算基準）
 */
export function lookupFare(
  odFares: TdxODFare[],
  fromId: string,
  toId: string,
  fareClass = 1,
  ticketType = 1,
): number | null {
  const od = odFares.find(
    (f) => f.OriginStationID === fromId && f.DestinationStationID === toId,
  );
  if (!od) return null;

  const fare = od.Fares.find(
    (f) => f.TicketType === ticketType && f.FareClass === fareClass,
  );
  return fare?.Price ?? null;
}
