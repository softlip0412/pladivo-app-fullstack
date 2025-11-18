"use client"

import { createContext, useContext, useEffect, useState } from "react"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchUser() {
    try {
      let res = await fetch("/api/auth/me", { credentials: "include" })

      // Nếu access token hết hạn, thử refresh
      if (res.status === 401) {
        const refreshRes = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        })
        if (refreshRes.ok) {
          res = await fetch("/api/auth/me", { credentials: "include" })
        }
      }

      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error("Fetch user error:", err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    setUser(null)
    window.location.href = "/" // về trang chủ
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
