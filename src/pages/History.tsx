import { useEffect, useState } from 'react'
import { useUser } from '../context/UserContext'
import { getRuns, getSessions } from '../lib/storage'
import type { RunEntry, WorkoutSession } from '../types'

export default function History() {
  const { currentUser } = useUser()
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [runs, setRuns] = useState<RunEntry[]>([])

  useEffect(() => {
    if (!currentUser) return
    setSessions(getSessions(currentUser.id))
    setRuns(getRuns(currentUser.id))
  }, [currentUser])

  if (!currentUser) return null

  if (currentUser.role === 'lifter') {
    const sorted = [...sessions]
      .filter((s) => s.status === 'completed')
      .sort((a, b) => b.date.localeCompare(a.date))

    return (
      <div className="mx-auto max-w-md px-4 py-6">
        <h1 className="text-xl font-semibold">History</h1>
        <div className="mt-4 flex flex-col gap-2">
          {sorted.length === 0 && (
            <p className="text-sm text-slate-500">No completed workouts yet.</p>
          )}
          {sorted.map((s) => {
            const totalSets = s.setLogs.length
            const totalReps = s.setLogs.reduce((sum, l) => sum + l.reps, 0)
            return (
              <div key={s.id} className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{s.planName}</span>
                  <span className="text-slate-400">{s.date}</span>
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {totalSets} sets · {totalReps} reps total
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const sorted = [...runs].sort((a, b) => b.date.localeCompare(a.date))
  const totalKm = runs.reduce((sum, r) => sum + r.distanceKm, 0)

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <h1 className="text-xl font-semibold">History</h1>
      <p className="mt-1 text-sm text-slate-400">{totalKm.toFixed(1)} km logged in total</p>
      <div className="mt-4 flex flex-col gap-2">
        {sorted.length === 0 && <p className="text-sm text-slate-500">No runs logged yet.</p>}
        {sorted.map((r) => (
          <div key={r.id} className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">{r.distanceKm} km</span>
              <span className="text-slate-400">{r.date}</span>
            </div>
            {(r.durationMin != null || r.notes) && (
              <div className="mt-1 text-xs text-slate-400">
                {r.durationMin != null && <span>{r.durationMin} min</span>}
                {r.notes && <span className="ml-2">{r.notes}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
