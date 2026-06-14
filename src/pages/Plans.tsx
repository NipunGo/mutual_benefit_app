import { useEffect, useState } from 'react'
import { useUser } from '../context/UserContext'
import { deletePlan, getPlans, savePlan, uid } from '../lib/storage'
import type { PlanExercise, WorkoutPlan } from '../types'

function ExerciseRow({
  exercise,
  onChange,
  onRemove,
}: {
  exercise: PlanExercise
  onChange: (ex: PlanExercise) => void
  onRemove: () => void
}) {
  return (
    <div className="grid grid-cols-[1fr_3rem_3rem_4rem_2rem] items-center gap-2 py-1">
      <input
        className="rounded bg-slate-700 px-2 py-1 text-sm"
        value={exercise.name}
        placeholder="Exercise"
        onChange={(e) => onChange({ ...exercise, name: e.target.value })}
      />
      <input
        className="w-full rounded bg-slate-700 px-1 py-1 text-center text-sm"
        type="number"
        min={1}
        value={exercise.targetSets}
        onChange={(e) => onChange({ ...exercise, targetSets: Number(e.target.value) || 1 })}
      />
      <input
        className="w-full rounded bg-slate-700 px-1 py-1 text-center text-sm"
        type="number"
        min={1}
        value={exercise.targetReps}
        onChange={(e) => onChange({ ...exercise, targetReps: Number(e.target.value) || 1 })}
      />
      <input
        className="w-full rounded bg-slate-700 px-1 py-1 text-center text-sm"
        type="number"
        min={0}
        placeholder="kg"
        value={exercise.targetWeight ?? ''}
        onChange={(e) =>
          onChange({
            ...exercise,
            targetWeight: e.target.value === '' ? undefined : Number(e.target.value),
          })
        }
      />
      <button onClick={onRemove} className="text-slate-400 active:text-red-400">
        ✕
      </button>
    </div>
  )
}

function PlanCard({ plan, onUpdate, onDelete }: { plan: WorkoutPlan; onUpdate: (p: WorkoutPlan) => void; onDelete: () => void }) {
  const [name, setName] = useState(plan.name)

  const addExercise = () => {
    const ex: PlanExercise = {
      id: uid(),
      name: '',
      targetSets: 3,
      targetReps: 10,
      order: plan.exercises.length,
    }
    onUpdate({ ...plan, exercises: [...plan.exercises, ex] })
  }

  const updateExercise = (updated: PlanExercise) => {
    onUpdate({
      ...plan,
      exercises: plan.exercises.map((ex) => (ex.id === updated.id ? updated : ex)),
    })
  }

  const removeExercise = (id: string) => {
    onUpdate({ ...plan, exercises: plan.exercises.filter((ex) => ex.id !== id) })
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
      <div className="flex items-center gap-2">
        <input
          className="flex-1 rounded bg-slate-700 px-2 py-1 font-medium"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => onUpdate({ ...plan, name })}
        />
        <button onClick={onDelete} className="text-sm text-slate-400 active:text-red-400">
          Delete
        </button>
      </div>

      {plan.exercises.length > 0 && (
        <div className="mt-3 grid grid-cols-[1fr_3rem_3rem_4rem_2rem] gap-2 text-xs text-slate-400">
          <span>Exercise</span>
          <span className="text-center">Sets</span>
          <span className="text-center">Reps</span>
          <span className="text-center">Wt</span>
          <span />
        </div>
      )}
      {plan.exercises.map((ex) => (
        <ExerciseRow
          key={ex.id}
          exercise={ex}
          onChange={updateExercise}
          onRemove={() => removeExercise(ex.id)}
        />
      ))}

      <button
        onClick={addExercise}
        className="mt-2 w-full rounded-lg border border-dashed border-slate-600 py-2 text-sm text-slate-400 active:bg-slate-700"
      >
        + Add exercise
      </button>
    </div>
  )
}

export default function Plans() {
  const { currentUser } = useUser()
  const [plans, setPlans] = useState<WorkoutPlan[]>([])
  const [newPlanName, setNewPlanName] = useState('')

  useEffect(() => {
    if (currentUser) setPlans(getPlans(currentUser.id))
  }, [currentUser])

  if (!currentUser) return null

  const updatePlan = (plan: WorkoutPlan) => {
    savePlan(plan)
    setPlans((prev) => prev.map((p) => (p.id === plan.id ? plan : p)))
  }

  const removePlan = (id: string) => {
    deletePlan(id)
    setPlans((prev) => prev.filter((p) => p.id !== id))
  }

  const addPlan = () => {
    if (!newPlanName.trim()) return
    const plan: WorkoutPlan = {
      id: uid(),
      userId: currentUser.id,
      name: newPlanName.trim(),
      exercises: [],
    }
    savePlan(plan)
    setPlans((prev) => [...prev, plan])
    setNewPlanName('')
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <h1 className="text-xl font-semibold">Workout Plans</h1>
      <p className="mt-1 text-sm text-slate-400">
        Set up your training days. You'll pick one of these to log against each session.
      </p>

      <div className="mt-4 flex gap-2">
        <input
          className="flex-1 rounded-lg bg-slate-800 px-3 py-2 text-sm"
          placeholder="New plan name (e.g. Push Day)"
          value={newPlanName}
          onChange={(e) => setNewPlanName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addPlan()}
        />
        <button
          onClick={addPlan}
          className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 active:bg-cyan-400"
        >
          Add
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {plans.length === 0 && (
          <p className="text-sm text-slate-500">No plans yet. Add your first training day above.</p>
        )}
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onUpdate={updatePlan} onDelete={() => removePlan(plan.id)} />
        ))}
      </div>
    </div>
  )
}
