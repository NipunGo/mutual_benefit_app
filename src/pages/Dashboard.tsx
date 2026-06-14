import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { getActivityDates } from '../lib/activity'
import { computeStreak } from '../lib/streaks'
import type { UserProfile } from '../types'

function StreakCard({ user }: { user: UserProfile }) {
  const streak = computeStreak(getActivityDates(user), user.targetFrequency)
  const unit = user.role === 'lifter' ? 'workouts' : 'run days'

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
      <div className="flex items-center justify-between">
        <span className="font-medium">{user.name}</span>
        <span className="text-sm text-slate-400">
          {user.role === 'lifter' ? '🏋️ Gym' : '🏃 Running'}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-6">
        <div>
          <div className="text-2xl font-bold text-cyan-400">{streak.current}</div>
          <div className="text-xs text-slate-400">current streak (wks)</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{streak.longest}</div>
          <div className="text-xs text-slate-400">longest streak (wks)</div>
        </div>
        <div>
          <div className="text-2xl font-bold">
            {streak.thisWeekCount}/{streak.thisWeekTarget}
          </div>
          <div className="text-xs text-slate-400">this week ({unit})</div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { currentUser, users } = useUser()
  const navigate = useNavigate()

  if (!currentUser) return null

  const actionLabel = currentUser.role === 'lifter' ? "Start today's workout" : 'Log a run'
  const actionPath = currentUser.role === 'lifter' ? '/workout' : '/run'

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <h1 className="text-xl font-semibold">Hey {currentUser.name} 👋</h1>
      <p className="mt-1 text-sm text-slate-400">
        {currentUser.role === 'lifter'
          ? 'Time to lift.'
          : 'Time to log those kilometres.'}
      </p>

      <button
        onClick={() => navigate(actionPath)}
        className="mt-4 w-full rounded-xl bg-cyan-500 py-3 font-semibold text-slate-900 active:bg-cyan-400"
      >
        {actionLabel}
      </button>

      <h2 className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Streaks
      </h2>
      <div className="flex flex-col gap-3">
        {users.map((u) => (
          <StreakCard key={u.id} user={u} />
        ))}
      </div>
    </div>
  )
}
