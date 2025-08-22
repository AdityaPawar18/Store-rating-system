// Authentication and authorization middleware
import jwt from "jsonwebtoken"
import pool from "../config/database.js"

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")

    // Verify user still exists in database
    const result = await pool.query("SELECT id, email, role FROM users WHERE id = $1", [decoded.userId])

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "User not found" })
    }

    req.user = result.rows[0]
    next()
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" })
  }
}

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" })
    }

    next()
  }
}

export const requireAdmin = requireRole(["admin"])
export const requireStoreOwner = requireRole(["store_owner"])
export const requireUser = requireRole(["user"])
