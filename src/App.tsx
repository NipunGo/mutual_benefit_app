import type { ReactNode } from 'react'
import { Navigate, Route, HashRouter, Routes } from 'react-router-dom'
import { UserProvider, useUser } from './context/UserContext'
import BottomNav from './components/BottomNav'
import ProfilePicker from './pages/ProfilePicker'
import Dashboard from './pages/Dashboard'
import Plans from './pages/Plans'
import Program from './pages/Program'
import Workout from './pages/Workout'
import RunLog from './pages/RunLog'
import History from './pages/History'
import Settings from './pages/Settings'

function RequireUser({ children }: { children: ReactNode }) {
  const { currentUser } = useUser()
  if (!currentUser) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { currentUser } = useUser()

  return (
    <>
      <div className="pb-16">
        <Routes>
          <Route
            path="/"
            element={currentUser ? <Navigate to="/dashboard" replace /> : <ProfilePicker />}
          />
          <Route
            path="/dashboard"
            element={
              <RequireUser>
                <Dashboard />
              </RequireUser>
            }
          />
          <Route
            path="/workout"
            element={
              <RequireUser>
                <Workout />
              </RequireUser>
            }
          />
          <Route
            path="/run"
            element={
              <RequireUser>
                <RunLog />
              </RequireUser>
            }
          />
          <Route
            path="/plans"
            element={
              <RequireUser>
                <Plans />
              </RequireUser>
            }
          />
          <Route
            path="/program"
            element={
              <RequireUser>
                <Program />
              </RequireUser>
            }
          />
          <Route
            path="/history"
            element={
              <RequireUser>
                <History />
              </RequireUser>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireUser>
                <Settings />
              </RequireUser>
            }
          />
        </Routes>
      </div>
      <BottomNav />
    </>
  )
}

export default function App() {
  return (
    <UserProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </UserProvider>
  )
}
