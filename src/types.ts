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
