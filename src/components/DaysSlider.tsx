"use client";

interface Props {
  value: number;
  onChange: (days: number) => void;
}

export function DaysSlider({ value, onChange }: Props) {
  const pct = ((value - 1) / 30) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/40">
          該月通勤天數
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black leading-none tabular-nums">
            {value}
          </span>
          <span className="text-xs text-white/40">天</span>
        </div>
      </div>

      <input
        type="range"
        min={1}
        max={31}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--fill": `${pct}%` } as React.CSSProperties}
        className="slider w-full"
      />

      <div className="mt-1.5 flex justify-between text-sm text-white/25">
        <span>1 天</span>
        <span>16 天</span>
        <span>31 天</span>
      </div>
    </div>
  );
}
