import { useEffect, useState } from 'react'
import { useUser } from '../context/UserContext'
import { deleteRun, getRuns, saveRun, uid } from '../lib/storage'
import { todayStr } from '../lib/dates'
import type { RunEntry } from '../types'

export default function RunLog() {
  const { currentUser } = useUser()
  const [runs, setRuns] = useState<RunEntry[]>([])
  const [date, setDate] = useState(todayStr())
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (currentUser) setRuns(getRuns(currentUser.id))
  }, [currentUser])

  if (!currentUser) return null

  const addRun = () => {
    const km = Number(distance)
    if (!km || km <= 0) return
    const run: RunEntry = {
      id: uid(),
      userId: currentUser.id,
      date,
      distanceKm: km,
      durationMin: duration === '' ? undefined : Number(duration),
      notes: notes.trim() || undefined,
      timestamp: new Date().toISOString(),
    }
    saveRun(run)
    setRuns((prev) => [run, ...prev])
    setDistance('')
    setDuration('')
    setNotes('')
  }

  const removeRun = (id: string) => {
    deleteRun(id)
    setRuns((prev) => prev.filter((r) => r.id !== id))
  }

  const sorted = [...runs].sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <h1 className="text-xl font-semibold">Log a Run</h1>

      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-700 bg-slate-800 p-4">
        <div>
          <label className="text-xs text-slate-400">Date</label>
          <input
            type="date"
            className="mt-1 w-full rounded bg-slate-700 px-2 py-2 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Distance (km)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            className="mt-1 w-full rounded bg-slate-700 px-2 py-2 text-sm"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="e.g. 5.2"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Duration (min, optional)</label>
          <input
            type="number"
            inputMode="numeric"
            className="mt-1 w-full rounded bg-slate-700 px-2 py-2 text-sm"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 30"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Notes (optional)</label>
          <input
            type="text"
            className="mt-1 w-full rounded bg-slate-700 px-2 py-2 text-sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. felt great"
          />
        </div>
        <button
          onClick={addRun}
          className="mt-1 w-full rounded-xl bg-cyan-500 py-3 font-semibold text-slate-900 active:bg-cyan-400"
        >
          Save run
        </button>
      </div>

      <h2 className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Recent runs
      </h2>
      <div className="flex flex-col gap-2">
        {sorted.length === 0 && <p className="text-sm text-slate-500">No runs logged yet.</p>}
        {sorted.slice(0, 10).map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
          >
            <div>
              <span className="font-medium">{r.distanceKm} km</span>
              <span className="ml-2 text-slate-400">{r.date}</span>
              {r.durationMin != null && <span className="ml-2 text-slate-400">{r.durationMin} min</span>}
              {r.notes && <div className="text-xs text-slate-500">{r.notes}</div>}
            </div>
            <button onClick={() => removeRun(r.id)} className="text-slate-400 active:text-red-400">
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
