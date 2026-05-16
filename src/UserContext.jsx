import { createContext, useContext, useEffect, useState } from 'react'
import { api, getUserToken, setUserToken } from './api'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(getUserToken()))

  // Restore session if we have a token in localStorage.
  useEffect(() => {
    if (!getUserToken()) return
    let cancelled = false
    api.me()
      .then((u) => { if (!cancelled) setUser(u) })
      .catch(() => { setUserToken(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  async function login(username, password) {
    const data = await api.login(username, password)
    setUserToken(data.token)
    setUser(data.user)
    return data.user
  }

  async function register(username, password, displayName) {
    const data = await api.register(username, password, displayName)
    setUserToken(data.token)
    setUser(data.user)
    return data.user
  }

  function logout() {
    setUserToken(null)
    setUser(null)
  }

  return (
    <UserContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
