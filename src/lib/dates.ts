// Date helpers - all dates as YYYY-MM-DD local strings

export function todayStr(): string {
  return toDateStr(new Date())
}

export function toDateStr(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Returns a key like "2026-W24" for the ISO week containing the given date
export function weekKey(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const target = new Date(d.valueOf())
  const dayNr = (d.getDay() + 6) % 7 // Monday = 0
  target.setDate(target.getDate() - dayNr + 3) // Thursday of this week
  const firstThursday = new Date(target.getFullYear(), 0, 4)
  const diff = target.valueOf() - firstThursday.valueOf()
  const week = 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000))
  return `${target.getFullYear()}-W${String(week).padStart(2, '0')}`
}

// Monday-based start-of-week date string for a given date
export function startOfWeekStr(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const dayNr = (d.getDay() + 6) % 7 // Monday = 0
  d.setDate(d.getDate() - dayNr)
  return toDateStr(d)
}

// Number of whole weeks between two week-start dates (a - b), both Monday-based YYYY-MM-DD
export function weekDiff(aStr: string, bStr: string): number {
  const a = new Date(aStr + 'T00:00:00')
  const b = new Date(bStr + 'T00:00:00')
  return Math.round((a.valueOf() - b.valueOf()) / (7 * 24 * 60 * 60 * 1000))
}
