import { DISCOUNT_TIERS } from "@/lib/calc";

interface Props {
  currentN: number;
}

export function DiscountTable({ currentN }: Props) {
  return (
    <section className="glass rounded-3xl p-5">
      <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/40">
        常客優惠折扣表
      </p>

      <div className="space-y-1.5">
        {DISCOUNT_TIERS.map((tier) => {
          const active = currentN >= tier.min && currentN <= tier.max;
          const rangeLabel =
            tier.max === Infinity
              ? `${tier.min} 次以上`
              : `${tier.min === 0 ? "0" : tier.min}–${tier.max} 次`;

          return (
            <div
              key={tier.min}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all duration-300 ${
                active ? "bg-white/10 ring-1 ring-white/15" : "opacity-40"
              }`}
            >
              <div
                className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                  active ? "bg-yellow-400" : "bg-white/20"
                }`}
              />
              <span className="flex-1 text-xs text-white/70">{rangeLabel}</span>
              <span
                className={`text-xs font-bold ${active ? "text-yellow-400" : "text-white/40"}`}
              >
                {tier.rate === 0 ? "原價" : `${tier.pct} 折扣`}
              </span>
              {active && (
                <span className="rounded-full bg-yellow-400/15 px-2 py-0.5 text-[10px] font-semibold text-yellow-400 ring-1 ring-yellow-400/30">
                  目前
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-white/25">
        折扣以「當月總搭乘次數」計算，第 11 次起享優惠，每月重新累計。
      </p>
    </section>
  );
}
