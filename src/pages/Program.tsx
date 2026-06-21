import { useEffect, useState } from 'react'
import { useUser } from '../context/UserContext'
import { getProgram, resetProgram, saveProgram } from '../lib/program'
import { uid } from '../lib/storage'
import type {
  ChecklistItem,
  FitnessProgram,
  ProgramSection,
} from '../types'

function countDone(items: ChecklistItem[]) {
  return items.reduce((n, i) => n + (i.done ? 1 : 0), 0)
}

export default function Program() {
  const { currentUser } = useUser()
  const [program, setProgram] = useState<FitnessProgram | null>(null)
  const [weekIdx, setWeekIdx] = useState(0)
  const [editing, setEditing] = useState(false)
  const [showTargets, setShowTargets] = useState(false)
  const [showSupps, setShowSupps] = useState(false)

  useEffect(() => {
    if (currentUser) setProgram(getProgram(currentUser.id))
  }, [currentUser])

  if (!currentUser || !program) return null

  function commit(next: FitnessProgram) {
    saveProgram(next)
    setProgram(next)
  }

  // Apply a mutation against a deep clone, then persist.
  function edit(fn: (draft: FitnessProgram) => void) {
    const next = structuredClone(program!)
    fn(next)
    commit(next)
  }

  const week = program.weeks[weekIdx]

  function findItem(draft: FitnessProgram, sectionId: string, itemId: string) {
    const all: ProgramSection[] = [...draft.weeks[weekIdx].sections, draft.supplements]
    const sec = all.find((s) => s.id === sectionId)
    return { sec, item: sec?.items.find((i) => i.id === itemId) }
  }

  function toggle(sectionId: string, itemId: string) {
    edit((d) => {
      const { item } = findItem(d, sectionId, itemId)
      if (item) item.done = !item.done
    })
  }

  function setWeight(sectionId: string, itemId: string, raw: string) {
    edit((d) => {
      const { item } = findItem(d, sectionId, itemId)
      if (!item) return
      if (raw === '') {
        item.weight = undefined
      } else {
        const n = Number(raw)
        item.weight = n
        if (item.exerciseKey) d.lastWeights[item.exerciseKey] = n
      }
    })
  }

  function setLabel(sectionId: string, itemId: string, label: string) {
    edit((d) => {
      const { item } = findItem(d, sectionId, itemId)
      if (item) item.label = label
    })
  }

  function setScheme(sectionId: string, itemId: string, scheme: string) {
    edit((d) => {
      const { item } = findItem(d, sectionId, itemId)
      if (item) item.scheme = scheme
    })
  }

  function removeItem(sectionId: string, itemId: string) {
    edit((d) => {
      const all: ProgramSection[] = [...d.weeks[weekIdx].sections, d.supplements]
      const sec = all.find((s) => s.id === sectionId)
      if (sec) sec.items = sec.items.filter((i) => i.id !== itemId)
    })
  }

  function addItem(sectionId: string, loggable: boolean) {
    edit((d) => {
      const all: ProgramSection[] = [...d.weeks[weekIdx].sections, d.supplements]
      const sec = all.find((s) => s.id === sectionId)
      if (!sec) return
      const item: ChecklistItem = loggable
        ? { id: uid(), label: 'New exercise', done: false, loggable: true, exerciseKey: uid(), scheme: '3×12' }
        : { id: uid(), label: 'New item', done: false }
      sec.items.push(item)
    })
  }

  function setSectionTitle(sectionId: string, title: string) {
    edit((d) => {
      const all: ProgramSection[] = [...d.weeks[weekIdx].sections, d.supplements]
      const sec = all.find((s) => s.id === sectionId)
      if (sec) sec.title = title
    })
  }

  function setWeekWeight(raw: string) {
    edit((d) => {
      d.weeks[weekIdx].weightKg = raw === '' ? undefined : Number(raw)
    })
  }

  function resetWeekTicks() {
    edit((d) => {
      for (const sec of d.weeks[weekIdx].sections)
        for (const it of sec.items) {
          it.done = false
          it.weight = undefined
        }
    })
  }

  function resetSuppTicks() {
    edit((d) => {
      for (const it of d.supplements.items) it.done = false
    })
  }

  // --- small render helpers ---

  function ItemRow({ section, item }: { section: ProgramSection; item: ChecklistItem }) {
    const lastW = item.exerciseKey ? program!.lastWeights[item.exerciseKey] : undefined
    const weightVal = item.weight ?? (item.done ? lastW : undefined)

    if (editing) {
      return (
        <div className="flex items-center gap-2 py-1">
          <input
            className="flex-1 rounded bg-slate-700 px-2 py-1 text-sm"
            value={item.label}
            onChange={(e) => setLabel(section.id, item.id, e.target.value)}
          />
          {item.loggable && (
            <input
              className="w-16 rounded bg-slate-700 px-2 py-1 text-center text-sm"
              value={item.scheme ?? ''}
              placeholder="3×12"
              onChange={(e) => setScheme(section.id, item.id, e.target.value)}
            />
          )}
          <button
            onClick={() => removeItem(section.id, item.id)}
            className="text-slate-400 active:text-red-400"
          >
            ✕
          </button>
        </div>
      )
    }

    return (
      <div className="py-1">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={item.done}
            onChange={() => toggle(section.id, item.id)}
            className="h-5 w-5 shrink-0 accent-cyan-500"
          />
          <span className={`flex-1 text-sm ${item.done ? 'text-slate-500 line-through' : ''}`}>
            {item.label}
          </span>
          {item.scheme && (
            <span className="shrink-0 rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
              {item.scheme}
            </span>
          )}
        </label>

        {item.done && item.loggable && (
          <div className="mt-1 ml-8 flex items-center gap-2">
            <span className="text-xs text-slate-400">Weight</span>
            <input
              type="number"
              inputMode="decimal"
              className="w-20 rounded bg-slate-700 px-2 py-1 text-center text-sm"
              value={weightVal ?? ''}
              placeholder={lastW != null ? `${lastW}` : 'kg'}
              onChange={(e) => setWeight(section.id, item.id, e.target.value)}
            />
            <span className="text-xs text-slate-400">kg</span>
            {lastW != null && item.weight == null && (
              <span className="text-xs text-slate-500">last: {lastW}kg</span>
            )}
          </div>
        )}
      </div>
    )
  }

  function SectionCard({ section }: { section: ProgramSection }) {
    const done = countDone(section.items)
    const total = section.items.length
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
        <div className="flex items-center justify-between gap-2">
          {editing && section.kind !== 'weekend' ? (
            <input
              className="flex-1 rounded bg-slate-700 px-2 py-1 font-medium"
              value={section.title}
              onChange={(e) => setSectionTitle(section.id, e.target.value)}
            />
          ) : (
            <span className="font-medium">{section.title}</span>
          )}
          <span className="shrink-0 text-xs text-slate-400">
            {done}/{total}
          </span>
        </div>
        {section.subtitle && !editing && (
          <p className="mt-0.5 text-xs text-slate-500">{section.subtitle}</p>
        )}

        {section.kind === 'weekend' && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-700/50 px-3 py-2">
            <span className="text-sm">⚖️ This week's weight</span>
            <input
              type="number"
              inputMode="decimal"
              className="ml-auto w-20 rounded bg-slate-700 px-2 py-1 text-center text-sm"
              value={week.weightKg ?? ''}
              placeholder="kg"
              onChange={(e) => setWeekWeight(e.target.value)}
            />
            <span className="text-xs text-slate-400">kg</span>
          </div>
        )}

        <div className="mt-2 divide-y divide-slate-700/60">
          {section.items.map((item) => (
            <ItemRow key={item.id} section={section} item={item} />
          ))}
        </div>

        {editing && (
          <button
            onClick={() => addItem(section.id, section.kind === 'gym' && section.title.startsWith('Day'))}
            className="mt-2 w-full rounded-lg border border-dashed border-slate-600 py-1.5 text-xs text-slate-400 active:bg-slate-700"
          >
            + Add item
          </button>
        )}
      </div>
    )
  }

  const weekDone = week.sections.reduce((n, s) => n + countDone(s.items), 0)
  const weekTotal = week.sections.reduce((n, s) => n + s.items.length, 0)

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">12-Week Program</h1>
          <p className="mt-1 text-xs text-slate-400">{program.goal}</p>
        </div>
        <button
          onClick={() => setEditing((e) => !e)}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium ${
            editing ? 'bg-cyan-500 text-slate-900' : 'border border-slate-600 text-slate-300'
          }`}
        >
          {editing ? 'Done' : 'Edit'}
        </button>
      </div>

      {/* Daily targets */}
      <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800">
        <button
          onClick={() => setShowTargets((s) => !s)}
          className="flex w-full items-center justify-between px-4 py-3"
        >
          <span className="font-medium">🎯 Daily Targets</span>
          <span className="text-slate-400">{showTargets ? '▲' : '▼'}</span>
        </button>
        {showTargets && (
          <div className="px-4 pb-4">
            {program.dailyTargets.map((t, i) =>
              editing ? (
                <div key={i} className="flex items-center gap-2 py-1">
                  <input
                    className="flex-1 rounded bg-slate-700 px-2 py-1 text-sm"
                    value={t}
                    onChange={(e) =>
                      edit((d) => {
                        d.dailyTargets[i] = e.target.value
                      })
                    }
                  />
                  <button
                    onClick={() => edit((d) => d.dailyTargets.splice(i, 1))}
                    className="text-slate-400 active:text-red-400"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div key={i} className="flex items-start gap-2 py-0.5 text-sm text-slate-300">
                  <span className="text-cyan-400">•</span>
                  {t}
                </div>
              ),
            )}
            {editing && (
              <button
                onClick={() => edit((d) => d.dailyTargets.push('New target'))}
                className="mt-2 w-full rounded-lg border border-dashed border-slate-600 py-1.5 text-xs text-slate-400 active:bg-slate-700"
              >
                + Add target
              </button>
            )}
          </div>
        )}
      </div>

      {/* Supplements */}
      <div className="mt-3 rounded-xl border border-slate-700 bg-slate-800">
        <button
          onClick={() => setShowSupps((s) => !s)}
          className="flex w-full items-center justify-between px-4 py-3"
        >
          <span className="font-medium">💊 {program.supplements.title}</span>
          <span className="text-slate-400">{showSupps ? '▲' : '▼'}</span>
        </button>
        {showSupps && (
          <div className="px-4 pb-4">
            <p className="mb-2 text-xs text-slate-500">{program.supplements.subtitle}</p>
            <div className="divide-y divide-slate-700/60">
              {program.supplements.items.map((item) => (
                <ItemRow key={item.id} section={program.supplements} item={item} />
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              {editing && (
                <button
                  onClick={() => addItem(program.supplements.id, false)}
                  className="flex-1 rounded-lg border border-dashed border-slate-600 py-1.5 text-xs text-slate-400 active:bg-slate-700"
                >
                  + Add supplement
                </button>
              )}
              {!editing && (
                <button
                  onClick={resetSuppTicks}
                  className="ml-auto text-xs text-slate-400 underline"
                >
                  Reset for today
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Week selector */}
      <div className="mt-5 grid grid-cols-6 gap-2">
        {program.weeks.map((w, i) => {
          const total = w.sections.reduce((n, s) => n + s.items.length, 0)
          const d = w.sections.reduce((n, s) => n + countDone(s.items), 0)
          const complete = total > 0 && d === total
          return (
            <button
              key={w.week}
              onClick={() => setWeekIdx(i)}
              className={`relative rounded-lg py-2 text-sm font-medium ${
                i === weekIdx
                  ? 'bg-cyan-500 text-slate-900'
                  : 'border border-slate-700 bg-slate-800 text-slate-300'
              }`}
            >
              {w.week}
              {complete && i !== weekIdx && (
                <span className="absolute right-1 top-0.5 text-[10px] text-emerald-400">✓</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Week header */}
      <div className="mt-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Week {week.week} · <span className="text-cyan-400">{week.phase}</span>
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">{week.focus}</p>
        </div>
        <span className="shrink-0 text-sm text-slate-400">
          {weekDone}/{weekTotal}
        </span>
      </div>

      {/* Sections */}
      <div className="mt-4 flex flex-col gap-3">
        {week.sections.map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}
      </div>

      {/* Footer actions */}
      <div className="mt-6 flex items-center justify-between">
        <button onClick={resetWeekTicks} className="text-xs text-slate-400 underline">
          Reset week's ticks
        </button>
        <button
          onClick={() => {
            if (confirm('Reset the ENTIRE 12-week program to the original plan? This clears all ticks, weights and edits.')) {
              setProgram(resetProgram(currentUser.id))
              setWeekIdx(0)
            }
          }}
          className="text-xs text-slate-500 underline"
        >
          Reset whole program
        </button>
      </div>
    </div>
  )
}
