import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  ensureSeeded,
  getCurrentUserId,
  getUser,
  getUsers,
  setCurrentUserId as persistCurrentUserId,
} from '../lib/storage'
import type { UserProfile } from '../types'

interface UserContextValue {
  users: UserProfile[]
  currentUser: UserProfile | null
  otherUser: UserProfile | null
  setCurrentUserId: (id: string) => void
  refreshUsers: () => void
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [currentUserId, setCurrentUserIdState] = useState<string | null>(null)

  useEffect(() => {
    ensureSeeded()
    setUsers(getUsers())
    setCurrentUserIdState(getCurrentUserId())
  }, [])

  const setCurrentUserId = (id: string) => {
    persistCurrentUserId(id)
    setCurrentUserIdState(id)
  }

  const refreshUsers = () => setUsers(getUsers())

  const currentUser = currentUserId ? getUser(currentUserId) ?? null : null
  const otherUser = currentUser ? users.find((u) => u.id !== currentUser.id) ?? null : null

  return (
    <UserContext.Provider value={{ users, currentUser, otherUser, setCurrentUserId, refreshUsers }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
