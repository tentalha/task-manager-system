import { getConnectionState } from "../config/database.js"
import mongoose from "mongoose"

/**
 * Middleware to check if MongoDB is connected
 */
export const checkMongoConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: "Database not connected. Please check MongoDB connection.",
      details: `MongoDB connection state: ${getConnectionState()}`,
    })
  }
  next()
}

