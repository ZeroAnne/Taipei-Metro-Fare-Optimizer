"use client";

import { Users, Info } from "lucide-react";
import { FARE_CLASS_OPTIONS } from "@/lib/types";
import type { FareClass } from "@/lib/types";

interface Props {
  value: FareClass;
  onChange: (fareClass: FareClass) => void;
}

export function FareClassSelector({ value, onChange }: Props) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Users size={13} className="text-white/40" />
        <p className="text-sm font-semibold uppercase tracking-widest text-white/40">
          乘客類型
        </p>
        <a
          href="https://www.metro.taipei/cp.aspx?n=CEF54168B23F73B4&s=AD70DC4F6A708EA7"
          target="_blank"
          rel="noopener noreferrer"
          title="台北捷運票種說明"
          className="text-white/25 hover:text-white/60 transition-colors"
        >
          <Info size={16} />
        </a>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {FARE_CLASS_OPTIONS.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                active
                  ? "bg-white text-slate-900 shadow-sm"
                  : "glass-light text-white/60 hover:bg-white/10"
              }`}
            >
              <span>{opt.label}</span>
              <span
                className={`text-[9px] font-normal mt-0.5 ${active ? "text-slate-600" : "text-white/30"}`}
              >
                {opt.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
