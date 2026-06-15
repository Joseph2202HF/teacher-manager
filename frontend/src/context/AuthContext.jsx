/**
 * AuthContext — gestion de l'état d'authentification global
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  // Vérifier le token au montage
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { 
      setLoading(false)
      return 
    }

    authAPI.me()
      .then(({ data }) => {
        if (data.user) {
          setUser(data.user)
          localStorage.setItem('user', JSON.stringify(data.user))
        }
      })
      .catch(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  // ─── Login ───
  const login = useCallback(async (credentials) => {
    const { data } = await authAPI.login(credentials)
    if (data.success || data.token) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
    }
    return data
  }, [])

  // ─── Register (NOUVEAU) ───
  const register = useCallback(async (userData) => {
    const { data } = await authAPI.register(userData)
    // Option 1 : Connecter automatiquement après inscription
    if (data.success || data.token) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
    }
    // Option 2 : Juste retourner les données sans connecter
    return data
  }, [])

  // ─── Forgot Password - Step 1 : Envoyer le code (NOUVEAU) ───
  const forgotPassword = useCallback(async (email) => {
    const { data } = await authAPI.forgotPassword({ email })
    return data
  }, [])

  // ─── Forgot Password - Step 2 : Vérifier le code (NOUVEAU) ───
  const verifyResetCode = useCallback(async (email, code) => {
    const { data } = await authAPI.verifyResetCode({ email, code })
    return data
  }, [])

  // ─── Forgot Password - Step 3 : Réinitialiser (NOUVEAU) ───
  const resetPassword = useCallback(async (email, code, newPassword) => {
    const { data } = await authAPI.resetPassword({ 
      email, 
      code, 
      password: newPassword 
    })
    return data
  }, [])

  // ─── Logout ───
  const logout = useCallback(async () => {
    await authAPI.logout().catch(() => {})
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  // ─── Mettre à jour l'utilisateur (utile pour profil) ───
  const updateUser = useCallback((userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }, [])

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        login, 
        register,           // ← NOUVEAU
        logout, 
        isAuth: !!user,
        forgotPassword,     // ← NOUVEAU
        verifyResetCode,    // ← NOUVEAU
        resetPassword,      // ← NOUVEAU
        updateUser          // ← NOUVEAU (bonus)
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
