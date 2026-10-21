import { createContext, useContext, useState } from 'react'
import { SESSION_KEY } from '../api/client'
import { login as loginRequest, logout as logoutRequest } from '../api/auth'
import { getMyProfile } from '../api/customers'

const AuthContext = createContext(null)

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)

  async function signIn(email, password) {
    const { token } = await loginRequest(email, password)

    // Save the token first, so the Axios interceptor can attach it to the next call.
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token }))

    try {
      const profile = await getMyProfile()
      const next = {
        token,
        email: profile.email,
        customerId: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(next))
      setSession(next)
    } catch (error) {
      localStorage.removeItem(SESSION_KEY)
      throw error
    }
  }

  async function signOut() {
    try {
      await logoutRequest()
    } catch {
      // The token may already be expired. Signing out locally is still correct.
    }
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
  }

  const value = {
    session,
    isAuthenticated: Boolean(session?.customerId),
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}