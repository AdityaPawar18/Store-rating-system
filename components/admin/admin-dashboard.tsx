"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Users, Store, BarChart3, LogOut, Settings } from "lucide-react"
import { DashboardStats } from "./dashboard-stats"
import { UserManagement } from "./user-management"
import { StoreManagement } from "./store-management"

interface User {
  id: number
  name: string
  email: string
  address: string
  role: "admin" | "user" | "store_owner"
}

interface AdminDashboardProps {
  user: User
  onLogout: () => void
}

type ActiveTab = "overview" | "users" | "stores" | "settings"

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview")

  const sidebarItems = [
    { id: "overview", label: "Dashboard", icon: BarChart3 },
    { id: "users", label: "User Management", icon: Users },
    { id: "stores", label: "Store Management", icon: Store },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <DashboardStats />
      case "users":
        return <UserManagement />
      case "stores":
        return <StoreManagement />
      case "settings":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Settings panel coming soon...</p>
            </CardContent>
          </Card>
        )
      default:
        return <DashboardStats />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-serif font-bold text-sidebar-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome, {user.name.split(" ")[0]}</p>
        </div>

        <Separator />

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <Button
                    variant={activeTab === item.id ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab(item.id as ActiveTab)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </li>
              )
            })}
          </ul>
        </nav>

        <Separator />

        <div className="p-4">
          <Button variant="outline" className="w-full justify-start gap-3 bg-transparent" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-serif font-bold text-card-foreground">
                {sidebarItems.find((item) => item.id === activeTab)?.label || "Dashboard"}
              </h2>
              <p className="text-muted-foreground">Manage your rating system platform</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">{renderContent()}</main>
      </div>
    </div>
  )
}
