"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"

interface User {
  id: number
  name: string
  email: string
  address: string
  role: "admin" | "user" | "store_owner"
}

interface LoginFormProps {
  onLogin: (user: User, token: string) => void
  onSwitchToRegister?: () => void
}

export function LoginForm({ onLogin, onSwitchToRegister }: LoginFormProps) {
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validateRegistration = () => {
    const errors: Record<string, string> = {}

    if (registerData.name.length < 20 || registerData.name.length > 60) {
      errors.name = "Name must be between 20 and 60 characters"
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(registerData.email)) {
      errors.email = "Please enter a valid email address"
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/
    if (!passwordRegex.test(registerData.password)) {
      errors.password = "Password must be 8-16 characters with at least one uppercase letter and one special character"
    }

    if (registerData.address.length > 400) {
      errors.address = "Address must not exceed 400 characters"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const response = await api.login(loginData.email, loginData.password)

    if (response.error) {
      setError(response.error)
    } else if (response.data) {
      onLogin(response.data.user, response.data.token)
    }

    setLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateRegistration()) return

    setLoading(true)
    setError("")

    const response = await api.register(registerData)

    if (response.error) {
      setError(response.error)
    } else if (response.data) {
      onLogin(response.data.user, response.data.token)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-serif font-bold text-primary">Rating System</CardTitle>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Name (20-60 characters)</Label>
                  <Input
                    id="register-name"
                    type="text"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    className={validationErrors.name ? "border-destructive" : ""}
                    required
                  />
                  {validationErrors.name && <p className="text-sm text-destructive">{validationErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className={validationErrors.email ? "border-destructive" : ""}
                    required
                  />
                  {validationErrors.email && <p className="text-sm text-destructive">{validationErrors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password (8-16 chars, 1 uppercase, 1 special)</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className={validationErrors.password ? "border-destructive" : ""}
                    required
                  />
                  {validationErrors.password && <p className="text-sm text-destructive">{validationErrors.password}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-address">Address (max 400 characters)</Label>
                  <Textarea
                    id="register-address"
                    value={registerData.address}
                    onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                    className={validationErrors.address ? "border-destructive" : ""}
                    rows={3}
                    required
                  />
                  {validationErrors.address && <p className="text-sm text-destructive">{validationErrors.address}</p>}
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
