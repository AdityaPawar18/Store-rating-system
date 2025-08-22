// Main Express server setup with authentication and API routes
import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import storeRoutes from "./routes/stores.js"
import ratingRoutes from "./routes/ratings.js"
import adminRoutes from "./routes/admin.js"
import { authenticateToken } from "./middleware/auth.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" })
})

// Public routes
app.use("/api/auth", authRoutes)

// Protected routes
app.use("/api/users", authenticateToken, userRoutes)
app.use("/api/stores", authenticateToken, storeRoutes)
app.use("/api/ratings", authenticateToken, ratingRoutes)
app.use("/api/admin", authenticateToken, adminRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
