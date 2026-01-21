import mongoose from "mongoose"
import {
  TASK_STATUS,
  TASK_PRIORITY,
  DEFAULT_STATUS,
  DEFAULT_PRIORITY,
  TASK_CONSTRAINTS,
} from "../utils/constants.js"

/**
 * Task Schema
 */
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      maxlength: [TASK_CONSTRAINTS.TITLE_MAX_LENGTH, "Title must not exceed 100 characters"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(TASK_STATUS),
        message: `Status must be one of: ${Object.values(TASK_STATUS).join(", ")}`,
      },
      default: DEFAULT_STATUS,
    },
    priority: {
      type: String,
      enum: {
        values: Object.values(TASK_PRIORITY),
        message: `Priority must be one of: ${Object.values(TASK_PRIORITY).join(", ")}`,
      },
      default: DEFAULT_PRIORITY,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // We handle timestamps manually
  }
)

// Update the updatedAt field before saving
taskSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now()
  }
  next()
})

// Index for better query performance
taskSchema.index({ status: 1, createdAt: -1 })
taskSchema.index({ title: "text" }) // For text search

const Task = mongoose.model("Task", taskSchema)

export default Task

