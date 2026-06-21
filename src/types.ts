export type Role = 'lifter' | 'runner'

export interface UserProfile {
  id: string
  name: string
  role: Role
  targetFrequency: number // sessions per week
}

export interface PlanExercise {
  id: string
  name: string
  targetSets: number
  targetReps: number
  targetWeight?: number
  order: number
}

export interface WorkoutPlan {
  id: string
  userId: string
  name: string
  exercises: PlanExercise[]
}

export interface SetLog {
  id: string
  planExerciseId: string
  exerciseName: string
  setNumber: number
  reps: number
  weight?: number
  timestamp: string
}

export interface WorkoutSession {
  id: string
  userId: string
  planId: string
  planName: string
  date: string // YYYY-MM-DD
  status: 'in_progress' | 'completed'
  setLogs: SetLog[]
}

export interface RunEntry {
  id: string
  userId: string
  date: string // YYYY-MM-DD
  distanceKm: number
  durationMin?: number
  notes?: string
  timestamp: string
}

// --- 12-week fitness program (checklist) ---

export interface ChecklistItem {
  id: string
  label: string
  done: boolean
  // Set only on gym-exercise items:
  loggable?: boolean // shows a weight box when ticked
  exerciseKey?: string // stable key used to remember weight across weeks
  scheme?: string // e.g. "3×12"
  weight?: number // weight logged for this specific session
}

export interface ProgramSection {
  id: string
  title: string // e.g. "Day 1 — Upper A"
  subtitle?: string // e.g. "+ 15–20 min incline walk"
  kind: 'gym' | 'weekend'
  items: ChecklistItem[]
}

export interface ProgramWeek {
  week: number // 1..12
  phase: string // "Foundation" | "Build" | "Push"
  focus: string // one-line note for the week
  sections: ProgramSection[]
  weightKg?: number // logged at the weekend
}

export interface FitnessProgram {
  id: string
  userId: string
  goal: string
  dailyTargets: string[] // reference card, editable
  supplements: ProgramSection
  weeks: ProgramWeek[]
  lastWeights: Record<string, number> // exerciseKey -> last logged weight
}
