"use client"

import { useEffect, useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { UserDashboard } from "@/components/user/user-dashboard"
import { StoreOwnerDashboard } from "@/components/store-owner/store-owner-dashboard"
import { api } from "@/lib/api"

interface User {
  id: number
  name: string
  email: string
  address: string
  role: "admin" | "user" | "store_owner"
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRegister, setShowRegister] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      api
        .getProfile()
        .then((response) => {
          if (response.data?.user) {
            setUser(response.data.user)
          } else {
            localStorage.removeItem("token")
          }
        })
        .catch(() => {
          localStorage.removeItem("token")
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = (userData: User, token: string) => {
    localStorage.setItem("token", token)
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    if (showRegister) {
      return <RegisterForm onRegister={handleLogin} onSwitchToLogin={() => setShowRegister(false)} />
    }
    return <LoginForm onLogin={handleLogin} onSwitchToRegister={() => setShowRegister(true)} />
  }

  switch (user.role) {
    case "admin":
      return <AdminDashboard user={user} onLogout={handleLogout} />
    case "user":
      return <UserDashboard user={user} onLogout={handleLogout} />
    case "store_owner":
      return <StoreOwnerDashboard user={user} onLogout={handleLogout} />
    default:
      return <LoginForm onLogin={handleLogin} />
  }
}
