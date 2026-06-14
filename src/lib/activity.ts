import { getRuns, getSessions } from './storage'
import type { UserProfile } from '../types'

/**
 * Returns one date string (YYYY-MM-DD) per "qualifying activity" for streak purposes.
 * Lifters: one entry per completed workout session.
 * Runners: one entry per distinct day with at least one logged run.
 */
export function getActivityDates(user: UserProfile): string[] {
  if (user.role === 'lifter') {
    return getSessions(user.id)
      .filter((s) => s.status === 'completed')
      .map((s) => s.date)
  }
  const days = new Set(getRuns(user.id).map((r) => r.date))
  return Array.from(days)
}
