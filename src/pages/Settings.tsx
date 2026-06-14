import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { saveUser } from '../lib/storage'

export default function Settings() {
  const { currentUser, refreshUsers, setCurrentUserId } = useUser()
  const navigate = useNavigate()
  const [name, setName] = useState(currentUser?.name ?? '')
  const [target, setTarget] = useState(String(currentUser?.targetFrequency ?? ''))
  const [saved, setSaved] = useState(false)

  if (!currentUser) return null

  const save = () => {
    const updated = {
      ...currentUser,
      name: name.trim() || currentUser.name,
      targetFrequency: Number(target) || currentUser.targetFrequency,
    }
    saveUser(updated)
    refreshUsers()
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const switchUser = () => {
    setCurrentUserId('')
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-700 bg-slate-800 p-4">
        <div>
          <label className="text-xs text-slate-400">Your name</label>
          <input
            className="mt-1 w-full rounded bg-slate-700 px-2 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">
            Weekly target ({currentUser.role === 'lifter' ? 'workouts' : 'run days'} per week)
          </label>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={7}
            className="mt-1 w-full rounded bg-slate-700 px-2 py-2 text-sm"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
          <p className="mt-1 text-xs text-slate-500">
            This sets the bar for your streak — hit this many {currentUser.role === 'lifter' ? 'workouts' : 'run days'} each week to keep it alive.
          </p>
        </div>
        <button
          onClick={save}
          className="mt-1 w-full rounded-xl bg-cyan-500 py-3 font-semibold text-slate-900 active:bg-cyan-400"
        >
          {saved ? 'Saved ✓' : 'Save'}
        </button>
      </div>

      <button
        onClick={switchUser}
        className="mt-4 w-full rounded-xl border border-slate-700 py-3 text-sm text-slate-300 active:bg-slate-800"
      >
        Switch user
      </button>
    </div>
  )
}
