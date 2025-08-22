"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Plus, Filter, ChevronLeft, ChevronRight, Mail, MapPin, Star, User } from "lucide-react"

interface StoreOwner {
  id: number
  name: string
  email: string
}

interface CreateStoreData {
  name: string
  email: string
  address: string
  ownerId: number
}

export function StoreManagement() {
  const [stores, setStores] = useState<any[]>([])
  const [storeOwners, setStoreOwners] = useState<StoreOwner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Filtering and pagination
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    address: "",
  })
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Create store dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createStoreData, setCreateStoreData] = useState<CreateStoreData>({
    name: "",
    email: "",
    address: "",
    ownerId: 0,
  })
  const [createLoading, setCreateLoading] = useState(false)

  const fetchStores = async (page = 1) => {
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        sortBy,
        sortOrder,
      })

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value.trim()) {
          params.append(key, value.trim())
        }
      })

      const response = await fetch(`http://localhost:5000/api/admin/stores?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStores(data.stores)
        setTotalPages(data.pagination.totalPages)
        setCurrentPage(data.pagination.page)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch stores")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchStoreOwners = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/admin/users?role=store_owner&limit=100", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStoreOwners(data.users)
      }
    } catch (err) {
      console.error("Failed to fetch store owners:", err)
    }
  }

  useEffect(() => {
    fetchStores()
    fetchStoreOwners()
  }, [sortBy, sortOrder])

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchStores(1)
  }

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/admin/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createStoreData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Store created successfully")
        setShowCreateDialog(false)
        setCreateStoreData({
          name: "",
          email: "",
          address: "",
          ownerId: 0,
        })
        fetchStores(currentPage)
      } else {
        setError(data.error || "Failed to create store")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setCreateLoading(false)
    }
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Store Management</h3>
          <p className="text-sm text-muted-foreground">Manage stores and assign owners</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Store
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
          <CardDescription>Filter stores by name, email, or address</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFilterSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="filter-name">Store Name</Label>
                <Input
                  id="filter-name"
                  placeholder="Search by name..."
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-email">Email</Label>
                <Input
                  id="filter-email"
                  placeholder="Search by email..."
                  value={filters.email}
                  onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-address">Address</Label>
                <Input
                  id="filter-address"
                  placeholder="Search by address..."
                  value={filters.address}
                  onChange={(e) => setFilters({ ...filters, address: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Searching..." : "Search"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFilters({ name: "", email: "", address: "" })
                  setCurrentPage(1)
                  fetchStores(1)
                }}
              >
                Clear Filters
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Success/Error Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Stores Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stores ({stores.length})</CardTitle>
          <CardDescription>Click column headers to sort</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No stores found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-muted rounded-lg font-medium text-sm">
                <button
                  className="col-span-3 text-left hover:text-primary transition-colors"
                  onClick={() => handleSort("name")}
                >
                  Store Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </button>
                <button
                  className="col-span-2 text-left hover:text-primary transition-colors"
                  onClick={() => handleSort("email")}
                >
                  Email {sortBy === "email" && (sortOrder === "asc" ? "↑" : "↓")}
                </button>
                <button
                  className="col-span-3 text-left hover:text-primary transition-colors"
                  onClick={() => handleSort("address")}
                >
                  Address {sortBy === "address" && (sortOrder === "asc" ? "↑" : "↓")}
                </button>
                <div className="col-span-2 text-left">Owner</div>
                <div className="col-span-1 text-left">Rating</div>
                <div className="col-span-1 text-left">Created</div>
              </div>

              {/* Table Rows */}
              {stores.map((store) => (
                <div
                  key={store.id}
                  className="grid grid-cols-12 gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                      {/* Store Icon Placeholder */}
                    </div>
                    <div>
                      <p className="font-medium truncate">{store.name}</p>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate">{store.email}</span>
                  </div>
                  <div className="col-span-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate">{store.address}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate">{store.owner_name}</span>
                  </div>
                  <div className="col-span-1 flex items-center gap-1">
                    {renderStars(Math.round(store.average_rating))}
                    <span className="text-xs text-muted-foreground ml-1">
                      {store.average_rating.toFixed(1)} ({store.total_ratings})
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <span className="text-xs text-muted-foreground">{formatDate(store.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStores(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStores(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Create Store Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Store</DialogTitle>
            <DialogDescription>Add a new store and assign it to a store owner.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateStore} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Store Name (20-60 characters)</Label>
              <Input
                id="create-name"
                value={createStoreData.name}
                onChange={(e) => setCreateStoreData({ ...createStoreData, name: e.target.value })}
                minLength={20}
                maxLength={60}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">Store Email</Label>
              <Input
                id="create-email"
                type="email"
                value={createStoreData.email}
                onChange={(e) => setCreateStoreData({ ...createStoreData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-address">Address (max 400 characters)</Label>
              <Input
                id="create-address"
                value={createStoreData.address}
                onChange={(e) => setCreateStoreData({ ...createStoreData, address: e.target.value })}
                maxLength={400}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-owner">Store Owner</Label>
              <Select
                value={createStoreData.ownerId.toString()}
                onValueChange={(value) => setCreateStoreData({ ...createStoreData, ownerId: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select store owner" />
                </SelectTrigger>
                <SelectContent>
                  {storeOwners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id.toString()}>
                      {owner.name} ({owner.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createLoading || createStoreData.ownerId === 0}>
                {createLoading ? "Creating..." : "Create Store"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
