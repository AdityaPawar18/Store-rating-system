// User-related routes (non-admin)
import express from "express"
import pool from "../config/database.js"

const router = express.Router()

// Get current user's profile
router.get("/profile", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, address, role, created_at FROM users WHERE id = $1", [
      req.user.id,
    ])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({ user: result.rows[0] })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
