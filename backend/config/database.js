import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/taskmanagement"

/**
 * Connect to MongoDB
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    console.log(" MongoDB connected successfully")
    console.log(` Database: ${MONGODB_URI.split("/").pop()}`)
    console.log(`Host: ${conn.connection.host}`)

    return conn
  } catch (error) {
    console.error(" MongoDB connection error:", error.message)
    console.error("\n Troubleshooting steps:")
    console.error("   1. Make sure MongoDB is running locally")
    console.error("   2. Check if MongoDB service is started: net start MongoDB (Windows)")
    console.error("   3. Or use MongoDB Atlas (cloud) and update MONGODB_URI in .env")
    console.error("   4. Verify the connection string in your .env file")
    process.exit(1)
  }
}

/**
 * Handle MongoDB connection events
 */
export const setupConnectionHandlers = () => {
  mongoose.connection.on("disconnected", () => {
    console.warn("  MongoDB disconnected")
  })

  mongoose.connection.on("error", (err) => {
    console.error(" MongoDB error:", err)
  })

  mongoose.connection.on("reconnected", () => {
    console.log(" MongoDB reconnected")
  })
}

/**
 * Get MongoDB connection state
 */
export const getConnectionState = () => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  }
  return states[mongoose.connection.readyState] || "unknown"
}

