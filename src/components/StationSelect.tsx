"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import type { Station } from "@/lib/types";
import { STATIONS } from "@/lib/stations";
import { getLineInfo, getLineCode, getStationNumber } from "@/lib/lines";

interface Props {
  label: string;
  value: Station | null;
  onChange: (station: Station) => void;
  excludeId?: string;
  pinColor?: "blue" | "purple";
}

/** 路線色碼標籤，例如 [BL18] */
function LineBadge({ stationId }: { stationId: string }) {
  const info = getLineInfo(stationId);
  const code = getLineCode(stationId);
  const number = getStationNumber(stationId);

  return (
    <span
      className={`
        inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5
        text-[10px] font-bold font-mono ring-1 shrink-0
        ${info.bgClass} ${info.textClass} ${info.ringClass}
      `}
    >
      <span>{code}</span>
      <span className="opacity-70">{number}</span>
    </span>
  );
}

export function StationSelect({
  label,
  value,
  onChange,
  excludeId,
  pinColor = "blue",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // 點擊外部關閉
  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  // 開啟時 focus 搜尋框
  useEffect(() => {
    if (open) {
      setQuery("");
      const id = setTimeout(() => searchRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [open]);

  const filtered = STATIONS.filter(
    (s) => s.name.includes(query) && s.id !== excludeId,
  );

  // 依路線分組
  const grouped = filtered.reduce<Record<string, Station[]>>((acc, s) => {
    if (!acc[s.line]) acc[s.line] = [];
    acc[s.line].push(s);
    return acc;
  }, {});

  const handleSelect = useCallback(
    (station: Station) => {
      onChange(station);
      setOpen(false);
    },
    [onChange],
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-semibold text-white/40 mb-1.5">
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="glass-light w-full rounded-2xl px-3 py-2.5 flex items-center gap-2 text-left hover:bg-white/10 transition-colors"
      >
        <MapPin
          size={15}
          className={`shrink-0 ${pinColor === "blue" ? "text-blue-400" : "text-purple-400"}`}
        />

        {value ? (
          <span className="flex items-center gap-1.5 flex-1 min-w-0">
            <LineBadge stationId={value.id} />
            <span className="text-sm text-white truncate">{value.name}</span>
          </span>
        ) : (
          <span className="text-sm text-white/40 flex-1">選擇車站</span>
        )}

        <ChevronDown
          size={14}
          className={`shrink-0 text-white/30 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="dropdown glass absolute z-50 top-full mt-1 w-full rounded-2xl overflow-hidden shadow-2xl">
          {/* 搜尋框 */}
          <div className="p-2 border-b border-white/10">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋車站名稱…"
              className="w-full rounded-xl bg-white/8 px-3 py-2 text-sm text-white placeholder-white/25 outline-none"
            />
          </div>

          {/* 清單 */}
          <div className="dropdown-list">
            {Object.keys(grouped).length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-white/30">
                找不到「{query}」
              </p>
            ) : (
              Object.entries(grouped).map(([line, stations]) => {
                // 用第一個站的 ID 取得路線色
                const lineInfo = getLineInfo(stations[0].id);

                return (
                  <div key={line}>
                    {/* Group header */}
                    <div className="flex items-center gap-2 px-3 pt-2.5 pb-1">
                      <div
                        className={`h-2 w-2 rounded-full ${lineInfo.dotClass}`}
                      />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                        {line}
                      </span>
                    </div>

                    {/* Station items */}
                    {stations.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelect(s)}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-white/10"
                      >
                        <LineBadge stationId={s.id} />
                        <span className="text-sm text-white">{s.name}</span>
                      </button>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
