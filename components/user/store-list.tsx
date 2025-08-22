"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Star, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { RatingDialog } from "./rating-dialog"

interface Store {
  id: number
  name: string
  address: string
  average_rating: number
  total_ratings: number
  user_rating: number | null
}

interface StoreListProps {
  userId: number
}

export function StoreList({ userId }: StoreListProps) {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchName, setSearchName] = useState("")
  const [searchAddress, setSearchAddress] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [showRatingDialog, setShowRatingDialog] = useState(false)

  const fetchStores = async (page = 1) => {
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      })

      if (searchName.trim()) {
        params.append("name", searchName.trim())
      }
      if (searchAddress.trim()) {
        params.append("address", searchAddress.trim())
      }

      const response = await fetch(`http://localhost:5000/api/stores?${params}`, {
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

  useEffect(() => {
    fetchStores()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchStores(1)
  }

  const handleRatingSubmit = async (storeId: number, rating: number) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ storeId, rating }),
      })

      if (response.ok) {
        // Refresh the store list to show updated ratings
        fetchStores(currentPage)
        setShowRatingDialog(false)
        setSelectedStore(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to submit rating")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    }
  }

  const renderStars = (rating: number, size = "h-4 w-4") => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Stores
          </CardTitle>
          <CardDescription>Find stores by name or address</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="search-name">Store Name</Label>
                <Input
                  id="search-name"
                  type="text"
                  placeholder="Enter store name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="search-address">Address</Label>
                <Input
                  id="search-address"
                  type="text"
                  placeholder="Enter address..."
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchName("")
                  setSearchAddress("")
                  setCurrentPage(1)
                  fetchStores(1)
                }}
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Store List */}
      <div className="space-y-4">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No stores found. Try adjusting your search criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {stores.map((store) => (
              <Card key={store.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{store.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {store.address}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Overall Rating</p>
                      <div className="flex items-center gap-2">
                        {renderStars(Math.round(store.average_rating))}
                        <span className="text-sm font-medium">
                          {store.average_rating.toFixed(1)} ({store.total_ratings} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {store.user_rating && (
                    <div>
                      <p className="text-sm text-muted-foreground">Your Rating</p>
                      <div className="flex items-center gap-2">
                        {renderStars(store.user_rating)}
                        <Badge variant="secondary">Rated {store.user_rating}/5</Badge>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setSelectedStore(store)
                        setShowRatingDialog(true)
                      }}
                      className="flex-1"
                    >
                      {store.user_rating ? "Update Rating" : "Rate Store"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

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

      {/* Rating Dialog */}
      {selectedStore && (
        <RatingDialog
          store={selectedStore}
          currentRating={selectedStore.user_rating}
          open={showRatingDialog}
          onOpenChange={setShowRatingDialog}
          onSubmit={handleRatingSubmit}
        />
      )}
    </div>
  )
}
