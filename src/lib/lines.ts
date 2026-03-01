/**
 * 台北捷運路線設定
 * TDX StationID 前綴 → 路線資訊
 *
 * 路線碼對照：
 *   BL → 板南線   (Blue)
 *   R  → 淡水信義線 + 信義線  (Red)
 *   G  → 松山新店線  (Green)
 *   O  → 中和新蘆線  (Orange)
 *   BR → 文湖線    (Brown)
 */

export type LineCode = 'BL' | 'R' | 'G' | 'O' | 'BR'

export type LineInfo = {
  code: LineCode
  label: string       // 完整路線名
  shortLabel: string  // 簡稱（下拉選單 group header）
  bgClass: string     // Tailwind: badge 底色
  textClass: string   // Tailwind: badge 文字
  ringClass: string   // Tailwind: badge border
  dotClass: string    // Tailwind: 小色點
}

export const LINE_INFO: Record<LineCode, LineInfo> = {
  BL: {
    code: 'BL',
    label: '板南線',
    shortLabel: '板南線',
    bgClass:   'bg-blue-500/20',
    textClass: 'text-blue-300',
    ringClass: 'ring-blue-500/30',
    dotClass:  'bg-blue-500',
  },
  R: {
    code: 'R',
    label: '淡水信義線',
    shortLabel: '淡水信義線',
    bgClass:   'bg-red-500/20',
    textClass: 'text-red-300',
    ringClass: 'ring-red-500/30',
    dotClass:  'bg-red-500',
  },
  G: {
    code: 'G',
    label: '松山新店線',
    shortLabel: '松山新店線',
    bgClass:   'bg-emerald-500/20',
    textClass: 'text-emerald-300',
    ringClass: 'ring-emerald-500/30',
    dotClass:  'bg-emerald-500',
  },
  O: {
    code: 'O',
    label: '中和新蘆線',
    shortLabel: '中和新蘆線',
    bgClass:   'bg-amber-500/20',
    textClass: 'text-amber-300',
    ringClass: 'ring-amber-500/30',
    dotClass:  'bg-amber-500',
  },
  BR: {
    code: 'BR',
    label: '文湖線',
    shortLabel: '文湖線',
    bgClass:   'bg-yellow-700/20',
    textClass: 'text-yellow-400',
    ringClass: 'ring-yellow-700/30',
    dotClass:  'bg-yellow-600',
  },
}

/** BL18 → 'BL' */
export function getLineCode(stationId: string): LineCode {
  // BR 必須在 R 之前判斷，否則 BR01 會被匹配成 R
  if (stationId.startsWith('BL')) return 'BL'
  if (stationId.startsWith('BR')) return 'BR'
  if (stationId.startsWith('R'))  return 'R'
  if (stationId.startsWith('G'))  return 'G'
  if (stationId.startsWith('O'))  return 'O'
  return 'R'
}

/** BL18 → '18'，R04A → '04A' */
export function getStationNumber(stationId: string): string {
  return stationId.replace(/^[A-Z]+/, '')
}

/** 取得完整路線資訊 */
export function getLineInfo(stationId: string): LineInfo {
  return LINE_INFO[getLineCode(stationId)]
}
