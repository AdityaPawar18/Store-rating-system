"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Store, LogOut, Settings, User } from "lucide-react"
import { StoreList } from "./store-list"
import { UserSettings } from "./user-settings"

interface UserType {
  id: number
  name: string
  email: string
  address: string
  role: "admin" | "user" | "store_owner"
}

interface UserDashboardProps {
  user: UserType
  onLogout: () => void
}

type ActiveTab = "stores" | "settings"

export function UserDashboard({ user, onLogout }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("stores")

  const sidebarItems = [
    { id: "stores", label: "Browse Stores", icon: Store },
    { id: "settings", label: "Account Settings", icon: Settings },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case "stores":
        return <StoreList userId={user.id} />
      case "settings":
        return <UserSettings user={user} />
      default:
        return <StoreList userId={user.id} />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-serif font-bold text-sidebar-foreground">Rating System</h1>
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
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg mb-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
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
                {sidebarItems.find((item) => item.id === activeTab)?.label || "Browse Stores"}
              </h2>
              <p className="text-muted-foreground">Discover and rate amazing stores</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">{renderContent()}</main>
      </div>
    </div>
  )
}
