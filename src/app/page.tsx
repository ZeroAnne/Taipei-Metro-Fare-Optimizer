"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Train,
  ArrowLeftRight,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Wifi,
} from "lucide-react";
import { StationSelect } from "@/components/StationSelect";
import { DaysSlider } from "@/components/DaysSlider";
import { TripSelector } from "@/components/TripSelector";
import { FareClassSelector } from "@/components/FareClassSelector";
import { ResultCard } from "@/components/ResultCard";
import { DiscountTable } from "@/components/DiscountTable";
import { calcFare, lookupFare } from "@/lib/calc";
import { fetchAndCacheFares, clearFareCache } from "@/lib/tdx-api";
import type { Station, FareClass, TdxODFare } from "@/lib/types";

type RefreshState = "idle" | "loading" | "done" | "error";

export default function Home() {
  const [fromStation, setFromStation] = useState<Station | null>(null);
  const [toStation, setToStation] = useState<Station | null>(null);
  const [days, setDays] = useState(22);
  const [tripsPerDay, setTripsPerDay] = useState(2);
  const [fareClass, setFareClass] = useState<FareClass>(1);

  // API 票價資料
  const [odFares, setOdFares] = useState<TdxODFare[]>([]);
  const [refreshState, setRefreshState] = useState<RefreshState>("idle");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const activeFare = useMemo(() => {
    if (!fromStation || !toStation || odFares.length === 0) return null;
    return lookupFare(odFares, fromStation.id, toStation.id, fareClass);
  }, [odFares, fromStation, toStation, fareClass]);

  const result = useMemo(() => {
    if (!fromStation || !toStation || activeFare === null) return null;
    return calcFare(activeFare, days, tripsPerDay);
  }, [fromStation, toStation, activeFare, days, tripsPerDay]);

  // 手動刷新票價
  const handleRefresh = useCallback(async () => {
    if (refreshState === "loading") return;

    setRefreshState("loading");
    try {
      clearFareCache();
      const fares = await fetchAndCacheFares();
      setOdFares(fares);
      setLastUpdated(new Date());
      setRefreshState("done");
      setTimeout(() => setRefreshState("idle"), 3000);
    } catch {
      setRefreshState("error");
      setTimeout(() => setRefreshState("idle"), 4000);
    }
  }, [refreshState]);

  function handleSwap() {
    setFromStation(toStation);
    setToStation(fromStation);
  }

  // ── 刷新按鈕外觀設定 ──
  const refreshConfig = {
    idle: {
      icon: RefreshCw,
      cls: "text-white/40 hover:text-white/70 hover:bg-white/10",
      spin: false,
    },
    loading: {
      icon: RefreshCw,
      cls: "text-blue-400 bg-blue-500/10",
      spin: true,
    },
    done: {
      icon: CheckCircle,
      cls: "text-green-400 bg-green-500/10",
      spin: false,
    },
    error: {
      icon: AlertCircle,
      cls: "text-red-400 bg-red-500/10",
      spin: false,
    },
  }[refreshState];

  const RefreshIcon = refreshConfig.icon;

  return (
    <main
      className="min-h-dvh px-4 py-6 md:py-10 text-white"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 20% 0%,  rgba(56, 100, 255, 0.18) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 80% 100%, rgba(120, 60, 220, 0.15) 0%, transparent 55%),
          #080e1e
        `,
      }}
    >
      <div className="mx-auto max-w-md space-y-4">
        {/* ── Header ── */}
        <header className="flex items-center gap-3 px-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/20 ring-1 ring-blue-400/30">
            <Train size={20} className="text-blue-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-base font-bold leading-none tracking-tight">
              北捷通勤精算師
            </h1>
            <p className="mt-0.5 text-sm font-medium text-white/35">
              Metro Fare Pro
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* 狀態 Badge */}
            {refreshState === "loading" ? (
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-sm font-semibold text-white/50 ring-1 ring-white/15">
                <RefreshCw size={11} className="animate-spin" />
                載入中
              </span>
            ) : odFares.length > 0 ? (
              <span className="flex items-center gap-1.5 rounded-full bg-green-500/15 px-2.5 py-1 text-sm font-semibold text-green-400 ring-1 ring-green-500/30">
                <Wifi size={11} />
                即時票價
              </span>
            ) : (
              <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-sm font-semibold text-red-400 ring-1 ring-red-500/30">
                載入失敗
              </span>
            )}

            {/* 刷新按鈕 */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshState === "loading"}
              title={
                refreshState === "loading"
                  ? "更新中…"
                  : refreshState === "done"
                    ? `已更新：${lastUpdated?.toLocaleTimeString("zh-TW")}`
                    : refreshState === "error"
                      ? "更新失敗，請稍後再試"
                      : "點擊從 TDX API 更新票價"
              }
              className={`
                flex h-8 w-8 items-center justify-center rounded-full
                transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-30
                ${refreshConfig.cls}
              `}
            >
              <RefreshIcon
                size={15}
                className={refreshConfig.spin ? "animate-spin" : ""}
              />
            </button>
          </div>
        </header>

        {/* ── Input Card ── */}
        <section className="glass rounded-3xl p-5 space-y-5">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/40">
              通勤路線
            </p>
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
              <StationSelect
                label="起站"
                value={fromStation}
                onChange={setFromStation}
                excludeId={toStation?.id}
                pinColor="blue"
              />
              <div className="mb-0.5">
                <button
                  type="button"
                  onClick={handleSwap}
                  title="交換起終站"
                  className="flex h-8 w-8 items-center justify-center rounded-full glass-light hover:bg-white/15 transition-colors active:scale-90"
                >
                  <ArrowLeftRight size={14} className="text-white/50" />
                </button>
              </div>
              <StationSelect
                label="終站"
                value={toStation}
                onChange={setToStation}
                excludeId={fromStation?.id}
                pinColor="purple"
              />
            </div>
          </div>

          <DaysSlider value={days} onChange={setDays} />
          <TripSelector value={tripsPerDay} onChange={setTripsPerDay} />
          <FareClassSelector value={fareClass} onChange={setFareClass} />

          {/* 狀態提示列 */}
          {refreshState === "error" && (
            <div className="flex items-center gap-2.5 rounded-2xl bg-red-500/8 px-3.5 py-2.5 ring-1 ring-red-500/20">
              <AlertCircle size={15} className="shrink-0 text-red-400" />
              <p className="text-xs text-red-300/80">
                票價資料載入失敗，請按右上角重新整理鍵再試一次。
              </p>
            </div>
          )}
          {odFares.length > 0 && lastUpdated && refreshState === "idle" && (
            <div className="flex items-center gap-2.5 rounded-2xl bg-green-500/8 px-3.5 py-2.5 ring-1 ring-green-500/20">
              <Wifi size={15} className="shrink-0 text-green-400" />
              <p className="text-xs text-white/50">
                TDX 即時票價
                <span className="text-green-400/70">
                  {" "}
                  · 更新時間：{lastUpdated.toLocaleString("zh-TW")}
                </span>
              </p>
            </div>
          )}
        </section>

        {/* ── Result Card ── */}
        <ResultCard
          result={result}
          fareClass={fareClass}
          fare={activeFare ?? null}
        />

        {/* ── Discount Table ── */}
        <DiscountTable currentN={days * tripsPerDay} />

        <p className="pb-4 text-center text-xs text-white/20">
          北捷通勤精算師 · 資料僅供參考 · 以台北捷運官方公告為準
        </p>
      </div>
    </main>
  );
}
