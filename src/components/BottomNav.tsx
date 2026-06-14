import { NavLink } from 'react-router-dom'
import { useUser } from '../context/UserContext'

const linkBase =
  'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors'

export default function BottomNav() {
  const { currentUser } = useUser()
  if (!currentUser) return null

  const logLabel = currentUser.role === 'lifter' ? 'Workout' : 'Run'
  const logPath = currentUser.role === 'lifter' ? '/workout' : '/run'

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 flex border-t border-slate-800 bg-slate-900/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `${linkBase} ${isActive ? 'text-cyan-400' : 'text-slate-400'}`
        }
      >
        <span className="text-lg">🏠</span>
        Home
      </NavLink>
      <NavLink
        to={logPath}
        className={({ isActive }) =>
          `${linkBase} ${isActive ? 'text-cyan-400' : 'text-slate-400'}`
        }
      >
        <span className="text-lg">{currentUser.role === 'lifter' ? '🏋️' : '🏃'}</span>
        {logLabel}
      </NavLink>
      {currentUser.role === 'lifter' && (
        <NavLink
          to="/plans"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? 'text-cyan-400' : 'text-slate-400'}`
          }
        >
          <span className="text-lg">📋</span>
          Plans
        </NavLink>
      )}
      <NavLink
        to="/history"
        className={({ isActive }) =>
          `${linkBase} ${isActive ? 'text-cyan-400' : 'text-slate-400'}`
        }
      >
        <span className="text-lg">📈</span>
        History
      </NavLink>
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `${linkBase} ${isActive ? 'text-cyan-400' : 'text-slate-400'}`
        }
      >
        <span className="text-lg">⚙️</span>
        Settings
      </NavLink>
    </nav>
  )
}
