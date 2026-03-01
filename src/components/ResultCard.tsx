"use client";

import { CreditCard, Ticket, Route, Zap } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import { TPASS_PRICE } from "@/lib/calc";
import { FARE_CLASS_OPTIONS } from "@/lib/types";
import type { CalcResult, FareClass } from "@/lib/types";

interface Props {
  result: CalcResult | null;
  fareClass: FareClass;
  fare: number | null;
}

export function ResultCard({ result, fareClass, fare }: Props) {
  const easycardDisplay = useCountUp(result?.easycardCost ?? 0);
  const savingsDisplay = useCountUp(result ? Math.abs(result.savings) : 0);

  const hasResult = result !== null;
  const fcLabel =
    FARE_CLASS_OPTIONS.find((o) => o.value === fareClass)?.label ?? "成人";
  const discountRate = result?.tier.rate ?? 0;

  // 主題設定
  const theme = !hasResult
    ? { card: "", banner: "bg-white/5 ring-white/10", amount: "text-white/40" }
    : result.tpassWins
      ? {
          card: "glow-green",
          banner: "bg-green-500/10 ring-green-500/30",
          amount: "text-green-400",
        }
      : result.savings < 0
        ? {
            card: "glow-blue",
            banner: "bg-blue-500/10  ring-blue-500/30",
            amount: "text-blue-400",
          }
        : {
            card: "",
            banner: "bg-white/5 ring-white/10",
            amount: "text-white",
          };

  return (
    <section
      className={`glass rounded-3xl p-5 transition-all duration-500 ${theme.card}`}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/40">
          試算結果
        </p>

        {/* Discount Badge */}
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ring-1 transition-all duration-300 ${
            discountRate > 0
              ? "bg-yellow-500/15 ring-yellow-500/30 text-yellow-400"
              : "bg-white/8 ring-white/15 text-white/50"
          }`}
        >
          <Zap size={12} />
          <span>
            {!hasResult
              ? "計算中…"
              : discountRate === 0
                ? "尚未享有折扣"
                : `常客 ${result.tier.pct} 回饋`}
          </span>
        </div>
      </div>

      {/* 本月總次數 + 票價資訊列 */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-2.5 rounded-2xl bg-white/5 px-4 py-3">
          <Route size={15} className="text-white/40 shrink-0" />
          <div>
            <p className="text-sm text-white/40">本月總搭乘次數</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-black tabular-nums">
                {result?.N ?? "—"}
              </span>
              {hasResult && <span className="text-xs text-white/40">次</span>}
            </div>
          </div>
        </div>

        {/* 目前票價 */}
        <div className="flex items-center gap-2.5 rounded-2xl bg-white/5 px-4 py-3">
          <CreditCard size={15} className="text-white/40 shrink-0" />
          <div>
            <p className="text-sm text-white/40">{fcLabel}票單程票價</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              {fare !== null ? (
                <>
                  <span className="text-sm text-white/30">$</span>
                  <span className="text-lg font-black tabular-nums">
                    {fare}
                  </span>
                  <span className="text-xs text-white/40">元</span>
                </>
              ) : (
                <span className="text-lg font-black text-white/30">—</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cost Comparison */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        {/* 悠遊卡 */}
        <div
          className={`rounded-2xl p-4 ring-1 transition-all duration-400 ${
            hasResult && !result.tpassWins && result.savings < 0
              ? "bg-blue-500/10 ring-blue-400/40"
              : "bg-white/5 ring-white/10"
          }`}
        >
          <div className="mb-3 flex items-center gap-1.5">
            <CreditCard size={14} className="text-blue-400" />
            <span className="text-sm font-semibold text-white/50">悠遊卡</span>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-sm text-white/30">$</span>
            <span className="text-2xl font-black tabular-nums">
              {hasResult ? easycardDisplay.toLocaleString("zh-TW") : "—"}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-white/30">元 / 月</p>
          <p className="mt-2 text-sm font-semibold text-blue-400">
            {discountRate > 0 ? `享 ${result?.tier.pct} 折扣` : "原價計費"}
          </p>
          {hasResult && discountRate > 0 && (
            <p className="mt-1 text-sm text-yellow-400/80">
              回饋 ${result.rebate.toLocaleString("zh-TW")} 元
            </p>
          )}
        </div>

        {/* TPASS */}
        <div
          className={`rounded-2xl p-4 ring-1 transition-all duration-400 ${
            hasResult && result.tpassWins
              ? "bg-green-500/10 ring-green-400/40"
              : "bg-white/5 ring-white/10"
          }`}
        >
          <div className="mb-3 flex items-center gap-1.5">
            <Ticket size={14} className="text-green-400" />
            <span className="text-sm font-semibold text-white/50">
              TPASS 定期票
            </span>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-sm text-white/30">$</span>
            <span className="text-2xl font-black tabular-nums">
              {TPASS_PRICE.toLocaleString("zh-TW")}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-white/30">元 / 月</p>
          <p className="mt-2 text-sm font-semibold text-green-400">
            北捷無限搭乘
          </p>
        </div>
      </div>

      {/* Savings Banner */}
      <div
        className={`rounded-2xl p-5 text-center ring-1 transition-all duration-500 ${theme.banner}`}
      >
        <p className="mb-1 text-xs font-medium text-white/40">
          {!hasResult
            ? "請選擇起站與終站"
            : result.tpassWins
              ? "建議辦 TPASS 定期票 🎫"
              : result.savings < 0
                ? "繼續刷悠遊卡 💳"
                : "費用完全一樣 🤝"}
        </p>
        <p
          className={`mb-1 text-4xl font-black tracking-tight leading-none ${theme.amount}`}
        >
          {!hasResult
            ? "—"
            : result.savings === 0
              ? "持平"
              : `省 $${savingsDisplay.toLocaleString("zh-TW")}`}
        </p>
        <p className="text-xs font-medium text-white/50">
          {!hasResult
            ? "輸入通勤資訊後，馬上試算"
            : result.tpassWins
              ? `比悠遊卡少花 ${Math.abs(result.savings).toLocaleString("zh-TW")} 元`
              : result.savings < 0
                ? `比 TPASS 少花 ${Math.abs(result.savings).toLocaleString("zh-TW")} 元`
                : "兩種方案費用相同，任選其一"}
        </p>
      </div>
    </section>
  );
}
