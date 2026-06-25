// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthChange, signIn, signUp, signOut,
  signInWithEmail, sendReset, changePassword, updateAccount, currentAuthMethod,
  resendVerification, reloadCurrentUser,
} from '../services/authService'
import { firebaseEnabled } from '../firebase/config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  const value = {
    user,
    loading,
    login: signIn,
    register: signUp,
    logout: signOut,
    loginWithEmail: signInWithEmail,
    resetPassword: sendReset,
    changePassword,
    updateAccount: async (patch) => {
      const u = await updateAccount(patch)
      setUser((prev) => ({ ...prev, ...u }))
      return u
    },
    authMethod: currentAuthMethod,
    // Verificação de e-mail (só relevante no modo Firebase).
    needsEmailVerification: Boolean(firebaseEnabled && user && user.emailVerified === false),
    resendVerification,
    reloadUser: async () => {
      const u = await reloadCurrentUser()
      if (u) setUser({ ...u })
      return u
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
