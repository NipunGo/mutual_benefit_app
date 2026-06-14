import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { getPlans, getSessions, saveSession, uid } from '../lib/storage'
import { todayStr } from '../lib/dates'
import type { PlanExercise, SetLog, WorkoutPlan, WorkoutSession } from '../types'

function ExerciseLogger({
  exercise,
  setLogs,
  onLogSet,
  disabled,
}: {
  exercise: PlanExercise
  setLogs: SetLog[]
  onLogSet: (reps: number, weight?: number) => void
  disabled: boolean
}) {
  const [reps, setReps] = useState(String(exercise.targetReps))
  const [weight, setWeight] = useState(exercise.targetWeight != null ? String(exercise.targetWeight) : '')

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
      <div className="flex items-center justify-between">
        <span className="font-medium">{exercise.name || 'Unnamed exercise'}</span>
        <span className="text-sm text-slate-400">
          {setLogs.length}/{exercise.targetSets} sets
        </span>
      </div>
      <div className="mt-1 text-xs text-slate-500">
        Target: {exercise.targetSets} × {exercise.targetReps}
        {exercise.targetWeight != null ? ` @ ${exercise.targetWeight}kg` : ''}
      </div>

      {setLogs.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {setLogs.map((log) => (
            <span key={log.id} className="rounded bg-slate-700 px-2 py-0.5 text-xs">
              {log.reps}
              {log.weight != null ? `@${log.weight}kg` : ''}
            </span>
          ))}
        </div>
      )}

      {!disabled && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-slate-400">Set {setLogs.length + 1}</span>
          <input
            type="number"
            inputMode="numeric"
            className="w-14 rounded bg-slate-700 px-2 py-1 text-center text-sm"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="reps"
          />
          <span className="text-xs text-slate-400">reps</span>
          <input
            type="number"
            inputMode="numeric"
            className="w-14 rounded bg-slate-700 px-2 py-1 text-center text-sm"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="kg"
          />
          <span className="text-xs text-slate-400">kg</span>
          <button
            onClick={() => onLogSet(Number(reps) || 0, weight === '' ? undefined : Number(weight))}
            className="ml-auto rounded-lg bg-cyan-500 px-3 py-1 text-sm font-semibold text-slate-900 active:bg-cyan-400"
          >
            Log
          </button>
        </div>
      )}
    </div>
  )
}

export default function Workout() {
  const { currentUser } = useUser()
  const [plans, setPlans] = useState<WorkoutPlan[]>([])
  const [planId, setPlanId] = useState('')
  const [session, setSession] = useState<WorkoutSession | null>(null)

  useEffect(() => {
    if (!currentUser) return
    const userPlans = getPlans(currentUser.id)
    setPlans(userPlans)
    if (userPlans.length > 0) setPlanId((prev) => prev || userPlans[0].id)
  }, [currentUser])

  useEffect(() => {
    if (!currentUser || !planId) return
    const today = todayStr()
    const existing = getSessions(currentUser.id).find((s) => s.date === today && s.planId === planId)
    if (existing) {
      setSession(existing)
    } else {
      const plan = plans.find((p) => p.id === planId)
      setSession({
        id: uid(),
        userId: currentUser.id,
        planId,
        planName: plan?.name ?? '',
        date: today,
        status: 'in_progress',
        setLogs: [],
      })
    }
  }, [currentUser, planId, plans])

  if (!currentUser) return null

  if (plans.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-6">
        <h1 className="text-xl font-semibold">Today's Workout</h1>
        <p className="mt-3 text-sm text-slate-400">
          You don't have any workout plans yet.{' '}
          <Link to="/plans" className="text-cyan-400 underline">
            Set one up
          </Link>{' '}
          to get started.
        </p>
      </div>
    )
  }

  const plan = plans.find((p) => p.id === planId)
  if (!session || !plan) return null

  const logSet = (exercise: PlanExercise, reps: number, weight?: number) => {
    const exLogs = session.setLogs.filter((l) => l.planExerciseId === exercise.id)
    const log: SetLog = {
      id: uid(),
      planExerciseId: exercise.id,
      exerciseName: exercise.name,
      setNumber: exLogs.length + 1,
      reps,
      weight,
      timestamp: new Date().toISOString(),
    }
    const updated: WorkoutSession = { ...session, setLogs: [...session.setLogs, log], status: 'in_progress' }
    setSession(updated)
    saveSession(updated)
  }

  const completeWorkout = () => {
    const updated: WorkoutSession = { ...session, status: 'completed' }
    setSession(updated)
    saveSession(updated)
  }

  const reopenWorkout = () => {
    const updated: WorkoutSession = { ...session, status: 'in_progress' }
    setSession(updated)
    saveSession(updated)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <h1 className="text-xl font-semibold">Today's Workout</h1>

      {plans.length > 1 && (
        <select
          value={planId}
          onChange={(e) => setPlanId(e.target.value)}
          className="mt-3 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm"
        >
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      )}

      {session.status === 'completed' && (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-emerald-700 bg-emerald-900/40 px-3 py-2 text-sm text-emerald-300">
          <span>✅ Completed today</span>
          <button onClick={reopenWorkout} className="text-xs underline">
            Log more
          </button>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {plan.exercises.length === 0 && (
          <p className="text-sm text-slate-500">
            This plan has no exercises yet.{' '}
            <Link to="/plans" className="text-cyan-400 underline">
              Add some
            </Link>
            .
          </p>
        )}
        {plan.exercises.map((ex) => (
          <ExerciseLogger
            key={ex.id}
            exercise={ex}
            setLogs={session.setLogs.filter((l) => l.planExerciseId === ex.id)}
            onLogSet={(reps, weight) => logSet(ex, reps, weight)}
            disabled={session.status === 'completed'}
          />
        ))}
      </div>

      {session.status === 'in_progress' && plan.exercises.length > 0 && (
        <button
          onClick={completeWorkout}
          className="mt-4 w-full rounded-xl bg-cyan-500 py-3 font-semibold text-slate-900 active:bg-cyan-400"
        >
          Mark workout complete
        </button>
      )}
    </div>
  )
}
