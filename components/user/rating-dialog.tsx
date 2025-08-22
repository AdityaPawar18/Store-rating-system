"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Star } from "lucide-react"

interface Store {
  id: number
  name: string
  address: string
  average_rating: number
  total_ratings: number
  user_rating: number | null
}

interface RatingDialogProps {
  store: Store
  currentRating: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (storeId: number, rating: number) => void
}

export function RatingDialog({ store, currentRating, open, onOpenChange, onSubmit }: RatingDialogProps) {
  const [selectedRating, setSelectedRating] = useState(currentRating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)

  const handleSubmit = () => {
    if (selectedRating > 0) {
      onSubmit(store.id, selectedRating)
    }
  }

  const renderInteractiveStars = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-1 rounded hover:bg-muted transition-colors"
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setSelectedRating(star)}
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                star <= (hoveredRating || selectedRating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-200"
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{currentRating ? "Update Your Rating" : "Rate This Store"}</DialogTitle>
          <DialogDescription>
            How would you rate <strong>{store.name}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            {renderInteractiveStars()}
            <p className="text-sm text-muted-foreground mt-2">
              {selectedRating > 0
                ? `You selected ${selectedRating} star${selectedRating > 1 ? "s" : ""}`
                : "Click to rate"}
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Store Information</h4>
            <p className="text-sm text-muted-foreground">{store.address}</p>
            <p className="text-sm text-muted-foreground">
              Current average: {store.average_rating.toFixed(1)}/5 ({store.total_ratings} reviews)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={selectedRating === 0}>
            {currentRating ? "Update Rating" : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
