import Task from "../models/Task.js"
import {
  TASK_CONSTRAINTS,
  SORT_OPTIONS,
  DEFAULT_STATUS,
  DEFAULT_PRIORITY,
} from "../utils/constants.js"

/**
 * Create a new task
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body

    const task = new Task({
      title: title.trim(),
      description: description?.trim() || "",
      status: status || DEFAULT_STATUS,
      priority: priority || DEFAULT_PRIORITY,
      dueDate: dueDate || null,
    })

    const savedTask = await task.save()
    res.status(201).json(savedTask)
  } catch (error) {
    next(error)
  }
}

/**
 * Get all tasks with optional filtering, sorting, and pagination
 */
export const getTasks = async (req, res, next) => {
  try {
    const { status, priority, sort, page, limit, search } = req.query
    const filter = {}

    // Build filter object
    if (status) {
      filter.status = status
    }
    if (priority) {
      filter.priority = priority
    }
    if (search && search.trim() !== "") {
      filter.title = { $regex: search.trim(), $options: "i" }
    }

    // Check if pagination is requested
    const hasPagination = "page" in req.query || "limit" in req.query

    // Build query
    let query = Task.find(filter)

    // Apply sorting
    if (sort === SORT_OPTIONS.DATE) {
      query = query.sort({ createdAt: -1 })
    } else if (sort === SORT_OPTIONS.STATUS) {
      query = query.sort({ status: 1, createdAt: -1 })
    } else {
      query = query.sort({ createdAt: -1 }) // Default sort
    }

    // Apply pagination if requested
    if (hasPagination) {
      const pageNum = Math.max(1, parseInt(String(page || "1"), 10))
      const limitNum = Math.max(
        1,
        Math.min(
          parseInt(String(limit || TASK_CONSTRAINTS.DEFAULT_PAGE_SIZE), 10),
          TASK_CONSTRAINTS.MAX_PAGE_SIZE
        )
      )
      const skip = (pageNum - 1) * limitNum

      // Get total count for pagination
      const totalTasks = await Task.countDocuments(filter)
      const totalPages = Math.ceil(totalTasks / limitNum)

      // Apply pagination
      query = query.skip(skip).limit(limitNum)

      const tasks = await query

      // Return tasks with pagination metadata
      res.json({
        tasks,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalTasks,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      })
    } else {
      // Backward compatibility: return array if no pagination requested
      const tasks = await query
      res.json(tasks)
    }
  } catch (error) {
    next(error)
  }
}

/**
 * Get a single task by ID
 */
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({ error: "Task not found" })
    }

    res.json(task)
  } catch (error) {
    next(error)
  }
}

/**
 * Update a task
 */
export const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body

    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({ error: "Task not found" })
    }

    // Update fields if provided
    if (title !== undefined) {
      task.title = title.trim()
    }
    if (description !== undefined) {
      task.description = description.trim()
    }
    if (status !== undefined) {
      task.status = status
    }
    if (priority !== undefined) {
      task.priority = priority
    }
    if (dueDate !== undefined) {
      task.dueDate = dueDate
    }

    // updatedAt is handled by the pre-save hook in the model

    const updatedTask = await task.save()
    res.json(updatedTask)
  } catch (error) {
    next(error)
  }
}

/**
 * Delete a task
 */
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({ error: "Task not found" })
    }

    await Task.findByIdAndDelete(req.params.id)
    res.json({ message: "Task deleted successfully" })
  } catch (error) {
    next(error)
  }
}

