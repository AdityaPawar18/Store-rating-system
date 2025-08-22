// Admin-only routes for managing users and stores
import express from "express"
import bcrypt from "bcryptjs"
import pool from "../config/database.js"
import { requireAdmin } from "../middleware/auth.js"
import { validateUserCreation, validateStoreCreation, validateSearch } from "../utils/validation.js"

const router = express.Router()

// Get dashboard statistics
router.get("/dashboard", requireAdmin, async (req, res) => {
  try {
    const [usersResult, storesResult, ratingsResult] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users"),
      pool.query("SELECT COUNT(*) FROM stores"),
      pool.query("SELECT COUNT(*) FROM ratings"),
    ])

    res.json({
      totalUsers: Number.parseInt(usersResult.rows[0].count),
      totalStores: Number.parseInt(storesResult.rows[0].count),
      totalRatings: Number.parseInt(ratingsResult.rows[0].count),
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Create new user (admin only)
router.post("/users", requireAdmin, async (req, res) => {
  try {
    const { error, value } = validateUserCreation.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { name, email, password, address, role } = value

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
      "INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role, created_at",
      [name, email, hashedPassword, address, role],
    )

    res.status(201).json({
      message: "User created successfully",
      user: result.rows[0],
    })
  } catch (error) {
    console.error("Create user error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get all users with filtering and sorting
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const { error, value } = validateSearch.validate(req.query)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { name, email, address, role, sortBy = "name", sortOrder = "asc", page = 1, limit = 10 } = value

    let query = "SELECT id, name, email, address, role, created_at FROM users WHERE 1=1"
    const params = []
    let paramCount = 0

    // Add search filters
    if (name) {
      paramCount++
      query += ` AND name ILIKE $${paramCount}`
      params.push(`%${name}%`)
    }

    if (email) {
      paramCount++
      query += ` AND email ILIKE $${paramCount}`
      params.push(`%${email}%`)
    }

    if (address) {
      paramCount++
      query += ` AND address ILIKE $${paramCount}`
      params.push(`%${address}%`)
    }

    if (role) {
      paramCount++
      query += ` AND role = $${paramCount}`
      params.push(role)
    }

    // Add sorting
    const validSortColumns = ["name", "email", "address", "role", "created_at"]
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "name"
    query += ` ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}`

    // Add pagination
    const offset = (page - 1) * limit
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
    params.push(limit, offset)

    const result = await pool.query(query, params)

    // Get total count for pagination
    let countQuery = "SELECT COUNT(*) FROM users WHERE 1=1"
    const countParams = []
    let countParamCount = 0

    if (name) {
      countParamCount++
      countQuery += ` AND name ILIKE $${countParamCount}`
      countParams.push(`%${name}%`)
    }

    if (email) {
      countParamCount++
      countQuery += ` AND email ILIKE $${countParamCount}`
      countParams.push(`%${email}%`)
    }

    if (address) {
      countParamCount++
      countQuery += ` AND address ILIKE $${countParamCount}`
      countParams.push(`%${address}%`)
    }

    if (role) {
      countParamCount++
      countQuery += ` AND role = $${countParamCount}`
      countParams.push(role)
    }

    const countResult = await pool.query(countQuery, countParams)
    const totalUsers = Number.parseInt(countResult.rows[0].count)

    res.json({
      users: result.rows,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
      },
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Create new store (admin only)
router.post("/stores", requireAdmin, async (req, res) => {
  try {
    const { error, value } = validateStoreCreation.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { name, email, address, ownerId } = value

    // Check if store email already exists
    const existingStore = await pool.query("SELECT id FROM stores WHERE email = $1", [email])

    if (existingStore.rows.length > 0) {
      return res.status(400).json({ error: "Store already exists with this email" })
    }

    // Check if owner exists and is a store owner
    const ownerResult = await pool.query("SELECT id, role FROM users WHERE id = $1", [ownerId])

    if (ownerResult.rows.length === 0) {
      return res.status(400).json({ error: "Owner not found" })
    }

    if (ownerResult.rows[0].role !== "store_owner") {
      return res.status(400).json({ error: "User must be a store owner" })
    }

    // Create store
    const result = await pool.query(
      "INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, address, ownerId],
    )

    res.status(201).json({
      message: "Store created successfully",
      store: result.rows[0],
    })
  } catch (error) {
    console.error("Create store error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get all stores with ratings and filtering
router.get("/stores", requireAdmin, async (req, res) => {
  try {
    const { error, value } = validateSearch.validate(req.query)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { name, email, address, sortBy = "name", sortOrder = "asc", page = 1, limit = 10 } = value

    let query = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        u.name as owner_name,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as total_ratings,
        s.created_at
      FROM stores s
      JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `

    const params = []
    let paramCount = 0

    // Add search filters
    if (name) {
      paramCount++
      query += ` AND s.name ILIKE $${paramCount}`
      params.push(`%${name}%`)
    }

    if (email) {
      paramCount++
      query += ` AND s.email ILIKE $${paramCount}`
      params.push(`%${email}%`)
    }

    if (address) {
      paramCount++
      query += ` AND s.address ILIKE $${paramCount}`
      params.push(`%${address}%`)
    }

    query += ` GROUP BY s.id, s.name, s.email, s.address, s.owner_id, u.name, s.created_at`

    // Add sorting
    const validSortColumns = ["name", "email", "address", "average_rating", "created_at"]
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "name"
    query += ` ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}`

    // Add pagination
    const offset = (page - 1) * limit
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
    params.push(limit, offset)

    const result = await pool.query(query, params)

    // Get total count for pagination
    let countQuery = "SELECT COUNT(DISTINCT s.id) FROM stores s WHERE 1=1"
    const countParams = []
    let countParamCount = 0

    if (name) {
      countParamCount++
      countQuery += ` AND s.name ILIKE $${countParamCount}`
      countParams.push(`%${name}%`)
    }

    if (email) {
      countParamCount++
      countQuery += ` AND s.email ILIKE $${countParamCount}`
      countParams.push(`%${email}%`)
    }

    if (address) {
      countParamCount++
      countQuery += ` AND s.address ILIKE $${countParamCount}`
      countParams.push(`%${address}%`)
    }

    const countResult = await pool.query(countQuery, countParams)
    const totalStores = Number.parseInt(countResult.rows[0].count)

    res.json({
      stores: result.rows,
      pagination: {
        page,
        limit,
        total: totalStores,
        totalPages: Math.ceil(totalStores / limit),
      },
    })
  } catch (error) {
    console.error("Get stores error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
