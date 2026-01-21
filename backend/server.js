import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectDB, setupConnectionHandlers } from "./config/database.js"
import taskRoutes from "./routes/taskRoutes.js"
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js"

// Load environment variables
dotenv.config()

// Create Express app
const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// API Routes
app.use("/api/tasks", taskRoutes)

// 404 handler (must be after all routes)
app.use(notFoundHandler)

// Error handling middleware (must be last)
app.use(errorHandler)

// Connect to database
connectDB()
setupConnectionHandlers()

// Start server
const PORT = parseInt(process.env.PORT, 10) || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server")
  process.exit(0)
})

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server")
  process.exit(0)
})
