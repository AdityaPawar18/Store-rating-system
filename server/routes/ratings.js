// Rating-related routes for normal users
import express from "express"
import pool from "../config/database.js"
import { requireRole } from "../middleware/auth.js"
import { validateRating } from "../utils/validation.js"

const router = express.Router()

// Submit or update a rating
router.post("/", requireRole(["user"]), async (req, res) => {
  try {
    const { error, value } = validateRating.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { storeId, rating } = value
    const userId = req.user.id

    // Check if store exists
    const storeResult = await pool.query("SELECT id FROM stores WHERE id = $1", [storeId])

    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: "Store not found" })
    }

    // Check if user already rated this store
    const existingRating = await pool.query("SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2", [
      userId,
      storeId,
    ])

    let result
    if (existingRating.rows.length > 0) {
      // Update existing rating
      result = await pool.query(
        "UPDATE ratings SET rating = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND store_id = $3 RETURNING *",
        [rating, userId, storeId],
      )
    } else {
      // Create new rating
      result = await pool.query("INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3) RETURNING *", [
        userId,
        storeId,
        rating,
      ])
    }

    res.json({
      message: existingRating.rows.length > 0 ? "Rating updated successfully" : "Rating submitted successfully",
      rating: result.rows[0],
    })
  } catch (error) {
    console.error("Submit rating error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get user's rating for a specific store
router.get("/store/:storeId", requireRole(["user"]), async (req, res) => {
  try {
    const storeId = Number.parseInt(req.params.storeId)
    const userId = req.user.id

    if (isNaN(storeId)) {
      return res.status(400).json({ error: "Invalid store ID" })
    }

    const result = await pool.query("SELECT * FROM ratings WHERE user_id = $1 AND store_id = $2", [userId, storeId])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Rating not found" })
    }

    res.json({ rating: result.rows[0] })
  } catch (error) {
    console.error("Get rating error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
