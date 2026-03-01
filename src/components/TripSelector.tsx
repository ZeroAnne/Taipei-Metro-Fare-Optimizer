"use client";

const OPTIONS = [1, 2, 3, 4] as const;

interface Props {
  value: number;
  onChange: (trips: number) => void;
}

export function TripSelector({ value, onChange }: Props) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/40">
        每天搭乘次數
      </p>
      <div className="glass-light grid grid-cols-4 gap-1.5 rounded-2xl p-1">
        {OPTIONS.map((n) => {
          const active = n === value;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`rounded-xl py-2.5 text-sm font-semibold transition-all ${
                active
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-white/60 hover:bg-white/10"
              }`}
            >
              {n} 次
            </button>
          );
        })}
      </div>
    </div>
  );
}
