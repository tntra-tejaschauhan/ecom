import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import * as authApi from '../api/auth'
import { AUTH_UNAUTHORIZED_EVENT, TOKEN_STORAGE_KEY, type ApiError } from '../api/client'
import { decodeJwtPayload, isTokenExpired } from '../lib/jwt'
import type { LoginPayload, RegisterPayload } from '../types/auth'

interface AuthState {
  token: string | null
  userId: number | null
  email: string | null
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

const EMAIL_STORAGE_KEY = 'ecom_user_email'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readInitialState(): AuthState {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(EMAIL_STORAGE_KEY)
    return { token: null, userId: null, email: null }
  }
  const payload = decodeJwtPayload(token)
  const userId = payload?.sub ? Number(payload.sub) : null
  return { token, userId, email: localStorage.getItem(EMAIL_STORAGE_KEY) }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(readInitialState)

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(EMAIL_STORAGE_KEY)
    setState({ token: null, userId: null, email: null })
  }, [])

  useEffect(() => {
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, clearSession)
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, clearSession)
  }, [clearSession])

  const login = useCallback(async (payload: LoginPayload) => {
    const tokenResponse = await authApi.login(payload)
    localStorage.setItem(TOKEN_STORAGE_KEY, tokenResponse.access_token)
    localStorage.setItem(EMAIL_STORAGE_KEY, payload.email)
    const decoded = decodeJwtPayload(tokenResponse.access_token)
    setState({
      token: tokenResponse.access_token,
      userId: decoded?.sub ? Number(decoded.sub) : null,
      email: payload.email,
    })
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    await authApi.register(payload)
    await login(payload)
  }, [login])

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAuthenticated: Boolean(state.token),
      login,
      register,
      logout,
    }),
    [state, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

export type { ApiError }
