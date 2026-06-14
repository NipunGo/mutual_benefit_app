import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'

export default function ProfilePicker() {
  const { users, setCurrentUserId } = useUser()
  const navigate = useNavigate()

  const choose = (id: string) => {
    setCurrentUserId(id)
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Mutual Benefit</h1>
        <p className="mt-1 text-sm text-slate-400">Who's logging in?</p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3">
        {users.map((u) => (
          <button
            key={u.id}
            onClick={() => choose(u.id)}
            className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800 px-5 py-4 text-left transition-colors active:bg-slate-700"
          >
            <span className="text-lg font-medium">{u.name}</span>
            <span className="text-sm text-slate-400">
              {u.role === 'lifter' ? '🏋️ Gym' : '🏃 Running'}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
