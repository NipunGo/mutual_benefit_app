import { startOfWeekStr, todayStr, weekDiff } from './dates'

export interface StreakResult {
  current: number
  longest: number
  thisWeekCount: number
  thisWeekTarget: number
}

/**
 * Computes a "weeks hitting target" streak.
 * dates: activity dates (YYYY-MM-DD), one entry per qualifying activity (dedupe per day before calling if needed)
 * target: activities per week needed for a week to "count"
 */
export function computeStreak(dates: string[], target: number): StreakResult {
  const today = todayStr()
  const currentWeekStart = startOfWeekStr(today)

  // Bucket activity counts by week-start date
  const counts = new Map<string, number>()
  for (const d of dates) {
    const wk = startOfWeekStr(d)
    counts.set(wk, (counts.get(wk) ?? 0) + 1)
  }

  const thisWeekCount = counts.get(currentWeekStart) ?? 0

  if (target <= 0) {
    return { current: 0, longest: 0, thisWeekCount, thisWeekTarget: target }
  }

  // Walk backwards week by week from current week
  let current = 0
  // If current (in-progress) week already meets target, count it and move on.
  // If it doesn't meet target yet, skip it (don't break streak - week isn't over).
  const currentMeets = thisWeekCount >= target
  if (currentMeets) {
    current += 1
  }
  let offset = 1
  while (true) {
    // find the week-start date `offset` weeks before currentWeekStart
    let wkStart = currentWeekStart
    // step back offset weeks
    const d = new Date(currentWeekStart + 'T00:00:00')
    d.setDate(d.getDate() - 7 * offset)
    wkStart = d.toISOString().slice(0, 10)
    const count = counts.get(wkStart) ?? 0
    if (count >= target) {
      current += 1
      offset += 1
    } else {
      break
    }
  }

  // Longest streak: scan all weeks that have any activity, find max consecutive run meeting target
  const weekStarts = Array.from(counts.keys()).sort()
  let longest = 0
  let run = 0
  let prev: string | null = null
  for (const wk of weekStarts) {
    const count = counts.get(wk) ?? 0
    const meets = count >= target
    if (!meets) {
      run = 0
      prev = wk
      continue
    }
    if (prev !== null && weekDiff(wk, prev) === 1) {
      run += 1
    } else {
      run = 1
    }
    longest = Math.max(longest, run)
    prev = wk
  }
  longest = Math.max(longest, current)

  return { current, longest, thisWeekCount, thisWeekTarget: target }
}
