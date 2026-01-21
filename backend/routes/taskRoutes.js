import express from "express"
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js"
import { checkMongoConnection } from "../middleware/checkMongoConnection.js"
import {
  validateCreateTask,
  validateUpdateTask,
} from "../middleware/validators.js"

const router = express.Router()

// Apply MongoDB connection check to all routes
router.use(checkMongoConnection)

// Task routes
router.post("/", validateCreateTask, createTask)
router.get("/", getTasks)
router.get("/:id", getTaskById)
router.patch("/:id", validateUpdateTask, updateTask)
router.delete("/:id", deleteTask)

export default router

