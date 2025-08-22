// Authentication routes - login, register, password update
import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import pool from "../config/database.js"
import { validateRegistration, validateLogin, validatePasswordUpdate } from "../utils/validation.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// User registration (normal users only)
router.post("/register", async (req, res) => {
  try {
    const { error, value } = validateRegistration.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { name, email, password, address } = value

    // Check if user already exists
    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email])

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists with this email" })
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const result = await pool.query(
      "INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role",
      [name, email, hashedPassword, address, "user"],
    )

    const user = result.rows[0]

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
    )

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user.id, name: user.name, email: user.email, address: user.address, role: user.role },
      token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// User login
router.post("/login", async (req, res) => {
  try {
    const { error, value } = validateLogin.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { email, password } = value

    // Find user
    const result = await pool.query("SELECT id, name, email, password, address, role FROM users WHERE email = $1", [
      email,
    ])

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const user = result.rows[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
    )

    res.json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email, address: user.address, role: user.role },
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Update password (protected route)
router.put("/password", authenticateToken, async (req, res) => {
  try {
    const { error, value } = validatePasswordUpdate.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { currentPassword, newPassword } = value
    const userId = req.user.id

    // Get current password hash
    const result = await pool.query("SELECT password FROM users WHERE id = $1", [userId])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, result.rows[0].password)
    if (!isValidPassword) {
      return res.status(400).json({ error: "Current password is incorrect" })
    }

    // Hash new password
    const saltRounds = 10
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update password
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedNewPassword, userId])

    res.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Password update error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get current user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, address, role FROM users WHERE id = $1", [req.user.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({ user: result.rows[0] })
  } catch (error) {
    console.error("Profile fetch error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
