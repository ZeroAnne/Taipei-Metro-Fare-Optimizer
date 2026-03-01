'use client'

import { useState, useEffect, useRef } from 'react'

/**
 * 數字跳動動畫 hook
 * @param target   目標數值
 * @param duration 動畫時長 ms（預設 350）
 */
export function useCountUp(target: number, duration = 350): number {
  const [display, setDisplay] = useState(target)
  const prevRef = useRef(target)

  useEffect(() => {
    const from = prevRef.current
    prevRef.current = target

    if (from === target) return

    const startTime = performance.now()
    let raf: number

    function tick(now: number) {
      const progress = Math.min((now - startTime) / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(from + (target - from) * eased))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return display
}
