"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Star, Users, TrendingUp, MapPin, Mail } from "lucide-react"

interface Store {
  id: number
  name: string
  email: string
  address: string
  average_rating: number
  total_ratings: number
}

interface Rating {
  id: number
  name: string
  email: string
  rating: number
  created_at: string
}

interface StoreOverviewProps {
  ownerId: number
}

export function StoreOverview({ ownerId }: StoreOverviewProps) {
  const [store, setStore] = useState<Store | null>(null)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const token = localStorage.getItem("token")

        // Fetch store information
        const storeResponse = await fetch("http://localhost:5000/api/stores/my-store", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (storeResponse.ok) {
          const storeData = await storeResponse.json()
          setStore(storeData.store)
        } else {
          const errorData = await storeResponse.json()
          setError(errorData.error || "Failed to fetch store information")
        }

        // Fetch ratings
        const ratingsResponse = await fetch("http://localhost:5000/api/stores/my-store/ratings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (ratingsResponse.ok) {
          const ratingsData = await ratingsResponse.json()
          setRatings(ratingsData.ratings)
        } else {
          const errorData = await ratingsResponse.json()
          setError(errorData.error || "Failed to fetch ratings")
        }
      } catch (err) {
        setError("Network error. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchStoreData()
  }, [ownerId])

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!store) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No store found. Please contact an administrator to set up your store.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Store Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{store.name}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {store.address}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{store.email}</span>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-card-foreground">{store.average_rating.toFixed(1)}</div>
              {renderStars(Math.round(store.average_rating), "h-5 w-5")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Out of 5 stars</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reviews</CardTitle>
            <Users className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{store.total_ratings}</div>
            <p className="text-xs text-muted-foreground mt-1">Customer reviews received</p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Ratings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Customer Reviews
          </CardTitle>
          <CardDescription>Recent ratings from your customers</CardDescription>
        </CardHeader>
        <CardContent>
          {ratings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No ratings yet. Encourage your customers to leave reviews!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div key={rating.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{rating.name}</h4>
                      <Badge variant="secondary">{formatDate(rating.created_at)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rating.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStars(rating.rating)}
                    <span className="text-sm font-medium">{rating.rating}/5</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>Key metrics for your store</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rating Distribution</span>
              <div className="flex items-center gap-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratings.filter((r) => r.rating === star).length
                  const percentage = ratings.length > 0 ? (count / ratings.length) * 100 : 0
                  return (
                    <div key={star} className="text-center">
                      <div className="text-xs text-muted-foreground">{star}★</div>
                      <div className="text-xs font-medium">{count}</div>
                      <div className="text-xs text-muted-foreground">({percentage.toFixed(0)}%)</div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Customer Engagement</span>
              <span className="font-medium">{store.total_ratings > 0 ? "Active" : "Getting Started"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Store Status</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
