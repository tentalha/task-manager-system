import {
  VALID_STATUSES,
  VALID_PRIORITIES,
  TASK_CONSTRAINTS,
} from "../utils/constants.js"

/**
 * Validate task creation data
 */
export const validateCreateTask = (req, res, next) => {
  const { title, status, priority } = req.body
  const errors = []

  // Title validation
  if (!title || typeof title !== "string" || title.trim() === "") {
    errors.push("Title is required")
  } else if (title.length > TASK_CONSTRAINTS.TITLE_MAX_LENGTH) {
    errors.push(`Title must not exceed ${TASK_CONSTRAINTS.TITLE_MAX_LENGTH} characters`)
  }

  // Status validation
  if (status && !VALID_STATUSES.includes(status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(", ")}`)
  }

  // Priority validation
  if (priority && !VALID_PRIORITIES.includes(priority)) {
    errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(", ")}`)
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(", ") })
  }

  next()
}

/**
 * Validate task update data
 */
export const validateUpdateTask = (req, res, next) => {
  const { title, status, priority } = req.body
  const errors = []

  // Title validation (if provided)
  if (title !== undefined) {
    if (typeof title !== "string" || title.trim() === "") {
      errors.push("Title cannot be empty")
    } else if (title.length > TASK_CONSTRAINTS.TITLE_MAX_LENGTH) {
      errors.push(`Title must not exceed ${TASK_CONSTRAINTS.TITLE_MAX_LENGTH} characters`)
    }
  }

  // Status validation (if provided)
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(", ")}`)
  }

  // Priority validation (if provided)
  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(", ")}`)
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(", ") })
  }

  next()
}

