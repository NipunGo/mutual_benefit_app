import type { RunEntry, UserProfile, WorkoutPlan, WorkoutSession } from '../types'

const KEYS = {
  users: 'mb_users',
  plans: 'mb_plans',
  sessions: 'mb_sessions',
  runs: 'mb_runs',
  currentUser: 'mb_current_user',
} as const

function read<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

const SEED_USERS: UserProfile[] = [
  { id: 'nipun', name: 'Nipun', role: 'lifter', targetFrequency: 4 },
  { id: 'partner', name: 'Partner', role: 'runner', targetFrequency: 3 },
]

export function ensureSeeded() {
  if (!localStorage.getItem(KEYS.users)) {
    write(KEYS.users, SEED_USERS)
  }
  if (!localStorage.getItem(KEYS.plans)) {
    write<WorkoutPlan[]>(KEYS.plans, [])
  }
  if (!localStorage.getItem(KEYS.sessions)) {
    write<WorkoutSession[]>(KEYS.sessions, [])
  }
  if (!localStorage.getItem(KEYS.runs)) {
    write<RunEntry[]>(KEYS.runs, [])
  }
}

// --- Users ---
export function getUsers(): UserProfile[] {
  return read<UserProfile[]>(KEYS.users, SEED_USERS)
}

export function getUser(id: string): UserProfile | undefined {
  return getUsers().find((u) => u.id === id)
}

export function saveUser(user: UserProfile) {
  const users = getUsers().map((u) => (u.id === user.id ? user : u))
  write(KEYS.users, users)
}

export function getCurrentUserId(): string | null {
  return localStorage.getItem(KEYS.currentUser)
}

export function setCurrentUserId(id: string) {
  localStorage.setItem(KEYS.currentUser, id)
}

// --- Plans ---
export function getPlans(userId: string): WorkoutPlan[] {
  return read<WorkoutPlan[]>(KEYS.plans, []).filter((p) => p.userId === userId)
}

export function getPlan(id: string): WorkoutPlan | undefined {
  return read<WorkoutPlan[]>(KEYS.plans, []).find((p) => p.id === id)
}

export function savePlan(plan: WorkoutPlan) {
  const plans = read<WorkoutPlan[]>(KEYS.plans, [])
  const idx = plans.findIndex((p) => p.id === plan.id)
  if (idx >= 0) plans[idx] = plan
  else plans.push(plan)
  write(KEYS.plans, plans)
}

export function deletePlan(id: string) {
  const plans = read<WorkoutPlan[]>(KEYS.plans, []).filter((p) => p.id !== id)
  write(KEYS.plans, plans)
}

// --- Sessions ---
export function getSessions(userId: string): WorkoutSession[] {
  return read<WorkoutSession[]>(KEYS.sessions, []).filter((s) => s.userId === userId)
}

export function getSession(id: string): WorkoutSession | undefined {
  return read<WorkoutSession[]>(KEYS.sessions, []).find((s) => s.id === id)
}

export function saveSession(session: WorkoutSession) {
  const sessions = read<WorkoutSession[]>(KEYS.sessions, [])
  const idx = sessions.findIndex((s) => s.id === session.id)
  if (idx >= 0) sessions[idx] = session
  else sessions.push(session)
  write(KEYS.sessions, sessions)
}

// --- Runs ---
export function getRuns(userId: string): RunEntry[] {
  return read<RunEntry[]>(KEYS.runs, []).filter((r) => r.userId === userId)
}

export function saveRun(run: RunEntry) {
  const runs = read<RunEntry[]>(KEYS.runs, [])
  runs.push(run)
  write(KEYS.runs, runs)
}

export function deleteRun(id: string) {
  const runs = read<RunEntry[]>(KEYS.runs, []).filter((r) => r.id !== id)
  write(KEYS.runs, runs)
}
