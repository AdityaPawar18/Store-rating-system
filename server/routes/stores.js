// Store-related routes for normal users and store owners
import express from "express"
import pool from "../config/database.js"
import { requireRole } from "../middleware/auth.js"
import { validateSearch } from "../utils/validation.js"

const router = express.Router()

// Get all stores with ratings (for normal users)
router.get("/", requireRole(["user"]), async (req, res) => {
  try {
    const { error, value } = validateSearch.validate(req.query)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { name, address, sortBy = "name", sortOrder = "asc", page = 1, limit = 10 } = value

    let query = `
      SELECT 
        s.id,
        s.name,
        s.address,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as total_ratings,
        ur.rating as user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = $1
      WHERE 1=1
    `

    const params = [req.user.id]
    let paramCount = 1

    // Add search filters
    if (name) {
      paramCount++
      query += ` AND s.name ILIKE $${paramCount}`
      params.push(`%${name}%`)
    }

    if (address) {
      paramCount++
      query += ` AND s.address ILIKE $${paramCount}`
      params.push(`%${address}%`)
    }

    query += ` GROUP BY s.id, s.name, s.address, ur.rating`

    // Add sorting
    const validSortColumns = ["name", "address", "average_rating"]
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

// Get store owner's store details and ratings
router.get("/my-store", requireRole(["store_owner"]), async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = $1
      GROUP BY s.id, s.name, s.email, s.address
    `,
      [req.user.id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Store not found" })
    }

    res.json({ store: result.rows[0] })
  } catch (error) {
    console.error("Get my store error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get users who rated the store owner's store
router.get("/my-store/ratings", requireRole(["store_owner"]), async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        u.id,
        u.name,
        u.email,
        r.rating,
        r.created_at
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      WHERE s.owner_id = $1
      ORDER BY r.created_at DESC
    `,
      [req.user.id],
    )

    res.json({ ratings: result.rows })
  } catch (error) {
    console.error("Get store ratings error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
