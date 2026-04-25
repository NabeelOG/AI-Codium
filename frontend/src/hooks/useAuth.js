import { useState, useEffect, useCallback } from 'react'
import { logout as apiLogout } from '../api/auth'

const TOKEN_KEY = 'auth_token'
const USER_KEY  = 'auth_user'

/**
 * useAuth — simple localStorage-backed auth state hook.
 *
 * Returns:
 *   token, user, isAuthenticated, login(token, user), logout(), isLoading
 */
export function useAuth() {
  const [token, setToken]       = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser]         = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  })
  const [isLoading, setIsLoading] = useState(false)

  const saveAuth = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [])

  const clearAuth = useCallback(async () => {
    setIsLoading(true)
    try { await apiLogout() } catch { /* ignore */ }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
    setIsLoading(false)
  }, [])

  return {
    token,
    user,
    isAuthenticated: Boolean(token),
    isLoading,
    login: saveAuth,
    logout: clearAuth,
  }
}
