/**
 * Application constants
 */

export const TASK_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
}

export const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
}

export const VALID_STATUSES = Object.values(TASK_STATUS)
export const VALID_PRIORITIES = Object.values(TASK_PRIORITY)

export const DEFAULT_STATUS = TASK_STATUS.PENDING
export const DEFAULT_PRIORITY = TASK_PRIORITY.MEDIUM

export const TASK_CONSTRAINTS = {
  TITLE_MAX_LENGTH: 100,
  DEFAULT_PAGE_SIZE: 6,
  MAX_PAGE_SIZE: 100,
}

export const SORT_OPTIONS = {
  DATE: "date",
  STATUS: "status",
}

