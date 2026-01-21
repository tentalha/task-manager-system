"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import "../page.css"

interface Task {
  _id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalTasks: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export default function TasksPage() {
  // Always start with false to match server render (prevents hydration error)
  const [darkMode, setDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterPriority, setFilterPriority] = useState("")
  const [sortBy, setSortBy] = useState("date")
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState("")
  const pageSize = 6

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  // Load dark mode preference from localStorage after mount (client-side only)
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("darkMode")
    if (saved === "true") {
      setDarkMode(true)
    }
  }, [])

  // Persist dark mode preference to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("darkMode", darkMode.toString())
    }
  }, [darkMode, mounted])

  // Fetch tasks with pagination
  const fetchTasks = async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams()
      if (searchQuery.trim()) params.append("search", searchQuery.trim())
      if (filterStatus) params.append("status", filterStatus)
      if (filterPriority) params.append("priority", filterPriority)
      if (sortBy) params.append("sort", sortBy)
      params.append("page", currentPage.toString())
      params.append("limit", pageSize.toString())

      const response = await fetch(`${API_URL}/tasks?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch tasks")
      }
      const data = await response.json()
      
      // Handle both old format (array) and new format (object with tasks and pagination)
      if (Array.isArray(data)) {
        setTasks(data)
        setPagination(null)
      } else if (data && data.tasks) {
        setTasks(data.tasks || [])
        setPagination(data.pagination || null)
      } else {
        setTasks([])
        setPagination(null)
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
      setError("Failed to fetch tasks. Make sure backend is running.")
      setTasks([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }

  // Fetch tasks on mount and when filters/page/search change
  useEffect(() => {
    fetchTasks()
  }, [filterStatus, filterPriority, sortBy, currentPage, searchQuery])

  // Update task status
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingTaskId(id)
    setError("")
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Refresh tasks after update
        fetchTasks()
      } else {
        const err = await response.json()
        setError(err.error || "Failed to update task status")
      }
    } catch (error) {
      setError("Error updating task status")
    } finally {
      setUpdatingTaskId(null)
    }
  }

  // Delete task
  const handleDeleteTask = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return
    }

    setDeletingTaskId(id)
    setError("")
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // If we're on the last page and it becomes empty, go to previous page
        if (pagination && tasks.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1)
        } else {
          fetchTasks()
        }
      } else {
        const err = await response.json()
        setError(err.error || "Failed to delete task")
      }
    } catch (error) {
      setError("Error deleting task")
    } finally {
      setDeletingTaskId(null)
    }
  }

  // Start editing task
  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task._id)
    setEditTitle(task.title)
    setEditDescription(task.description || "")
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingTaskId(null)
    setEditTitle("")
    setEditDescription("")
  }

  // Save edited task
  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim()) {
      setError("Title is required")
      return
    }
    if (editTitle.length > 100) {
      setError("Title must not exceed 100 characters")
      return
    }

    setUpdatingTaskId(id)
    setError("")
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: editTitle.trim(),
          description: editDescription.trim()
        }),
      })

      if (response.ok) {
        setEditingTaskId(null)
        setEditTitle("")
        setEditDescription("")
        fetchTasks()
      } else {
        const err = await response.json()
        setError(err.error || "Failed to update task")
      }
    } catch (error) {
      setError("Error updating task")
    } finally {
      setUpdatingTaskId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleFilterChange = () => {
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1) // Reset to first page when search changes
  }

  return (
    <div className={`app ${darkMode ? "dark-mode" : ""}`}>
      <header className="app-header">
        <div className="header-content">
          <h1>All Tasks</h1>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <Link href="/" className="btn btn-outline">
              ← Create Task
            </Link>
            <button
              className="theme-toggle"
              onClick={() => setDarkMode((prev) => !prev)}
              aria-label="Toggle dark mode"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="form-error" style={{ margin: "1rem 0" }}>
            {error}
          </div>
        )}

        {/* Filter Bar */}
        <section className="filter-section">
          <div className="filter-bar" style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-end" }}>
            <div className="filter-group" style={{ flex: "1 1 250px", minWidth: "200px" }}>
              <label htmlFor="search-input">Search Tasks:</label>
              <input
                id="search-input"
                type="text"
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="filter-select"
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>
            <div className="filter-group">
              <label htmlFor="status-filter">Status:</label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value)
                  handleFilterChange()
                }}
                className="filter-select"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="priority-filter">Priority:</label>
              <select
                id="priority-filter"
                value={filterPriority}
                onChange={(e) => {
                  setFilterPriority(e.target.value)
                  handleFilterChange()
                }}
                className="filter-select"
              >
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="sort-filter">Sort By:</label>
              <select
                id="sort-filter"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value)
                  handleFilterChange()
                }}
                className="filter-select"
              >
                <option value="date">Creation Date</option>
                <option value="status">Status</option>
              </select>
            </div>

            <button
              className="btn btn-outline-sm"
              onClick={() => {
                setSearchQuery("")
                setFilterStatus("")
                setFilterPriority("")
                setSortBy("date")
                setCurrentPage(1)
              }}
            >
              Reset Filters
            </button>
          </div>
        </section>

        {/* Task List */}
        <section className="tasks-section">
          {loading && (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading tasks...</p>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "normal" }}>
                Please wait while we fetch your tasks
              </p>
            </div>
          )}
          {!loading && tasks.length === 0 && (
            <div className="empty-state">
              <p>No tasks found. Create one to get started!</p>
              <Link href="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>
                Create Task
              </Link>
            </div>
          )}
          {!loading && tasks.length > 0 && (
            <>
              {pagination && (
                <div style={{ marginBottom: "1rem", padding: "0.75rem", background: darkMode ? "#1a1a1a" : "#f5f5f5", borderRadius: "8px" }} className="pagination-info">
                  <div>
                    <strong>
                      Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, pagination.totalTasks)} of {pagination.totalTasks} tasks
                    </strong>
                  </div>
                  <div className="pagination-controls">
                    <button
                      className="btn btn-outline-sm"
                      onClick={() => handlePageChange(1)}
                      disabled={!pagination.hasPrevPage}
                    >
                      First
                    </button>
                    <button
                      className="btn btn-outline-sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                    >
                      Previous
                    </button>
                    <span style={{ padding: "0 0.5rem" }}>
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      className="btn btn-outline-sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      Next
                    </button>
                    <button
                      className="btn btn-outline-sm"
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={!pagination.hasNextPage}
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}
              <div className="task-list">
                {tasks.map((task) => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed"

                  const isEditing = editingTaskId === task._id
                  const isUpdating = updatingTaskId === task._id
                  const isDeleting = deletingTaskId === task._id

                  return (
                    <div key={task._id} className={`task-card task-${task.status} priority-${task.priority}`} style={{ position: "relative" }}>
                      {(isUpdating || isDeleting) && (
                        <div className="task-loading-overlay">
                          <div className="task-loading-overlay-content">
                            <div className="spinner"></div>
                            <p>{isUpdating ? "Updating..." : "Deleting..."}</p>
                          </div>
                        </div>
                      )}
                      <div className="task-header">
                        {isEditing ? (
                          <div style={{ width: "100%", marginBottom: "0.5rem" }}>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="form-input"
                              style={{ width: "100%", marginBottom: "0.5rem", fontSize: "1.1rem", fontWeight: "bold" }}
                              placeholder="Task title"
                              maxLength={100}
                              disabled={isUpdating}
                            />
                            <small style={{ color: "var(--text-secondary)" }}>{editTitle.length}/100</small>
                          </div>
                        ) : (
                          <h3 
                            style={{ cursor: "pointer", position: "relative" }}
                            onClick={() => handleStartEdit(task)}
                            title="Click to edit"
                          >
                            {task.title}
                            <span style={{ fontSize: "0.7rem", marginLeft: "0.5rem", opacity: 0.6 }}>✏️</span>
                          </h3>
                        )}
                        <div className="task-badges">
                          <span className={`badge priority-badge priority-${task.priority}`}>
                            {task.priority.toUpperCase()}
                          </span>
                          <span className={`badge status-badge status-${task.status}`}>
                            {task.status.replace("-", " ").toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {isEditing ? (
                        <div style={{ marginBottom: "1rem" }}>
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="form-input form-textarea"
                            style={{ width: "100%", minHeight: "80px", resize: "vertical" }}
                            placeholder="Task description (optional)"
                            disabled={isUpdating}
                          />
                        </div>
                      ) : (
                        <p 
                          className="task-description" 
                          style={{ cursor: "pointer", minHeight: task.description ? "auto" : "1.5rem" }}
                          onClick={() => handleStartEdit(task)}
                          title="Click to edit"
                        >
                          {task.description || <span style={{ opacity: 0.5, fontStyle: "italic" }}>Click to add description...</span>}
                          <span style={{ fontSize: "0.7rem", marginLeft: "0.5rem", opacity: 0.6 }}>✏️</span>
                        </p>
                      )}

                      <div className="task-meta">
                        <span className="meta-item">Created: {formatDate(task.createdAt)}</span>
                        {task.dueDate && (
                          <span className={`meta-item ${isOverdue ? "overdue" : ""}`}>
                            Due: {formatDate(task.dueDate)} {isOverdue && "(Overdue)"}
                          </span>
                        )}
                      </div>

                      <div className="task-actions justify-between">
                        {isEditing ? (
                          <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleSaveEdit(task._id)}
                              disabled={isUpdating || !editTitle.trim()}
                              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                            >
                              {isUpdating && <div className="spinner-small"></div>}
                              {isUpdating ? "Saving..." : "Save"}
                            </button>
                            <button
                              className="btn btn-sm btn-outline-sm"
                              onClick={handleCancelEdit}
                              disabled={isUpdating}
                              style={{ flex: 1 }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="form-group" style={{ marginBottom: "0.5rem", marginTop: "0" }}>
                              <label htmlFor={`status-${task._id}`} style={{ fontSize: "0.85rem", marginBottom: "0.25rem", display: "block" }}>
                                Update Status:
                              </label>
                              <select
                                id={`status-${task._id}`}
                                value={task.status}
                                onChange={(e) => handleUpdateStatus(task._id, e.target.value)}
                                disabled={isUpdating || isDeleting}
                                className="form-input"
                                style={{ 
                                  padding: "0.5rem", 
                                  fontSize: "0.9rem",
                                  width: "100%",
                                  cursor: (isUpdating || isDeleting) ? "not-allowed" : "pointer",
                                  opacity: (isUpdating || isDeleting) ? 0.6 : 1
                                }}
                              >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                              </select>
                              {isUpdating && (
                                <div className="loading-indicator">
                                  <div className="spinner-small"></div>
                                  <span>Updating status...</span>
                                </div>
                              )}
                            </div>

                            <button
                              className="btn h-max px-1.5 py-0.5 max-w-fit w-full  btn-danger"
                              onClick={() => handleDeleteTask(task._id)}
                              disabled={isUpdating || isDeleting}
                              style={{ 
                                opacity: (isUpdating || isDeleting) ? 0.6 : 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem"
                              }}
                            >
                              {isDeleting && <div className="spinner-small"></div>}
                              {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              {pagination && pagination.totalPages > 1 && (
                <div style={{ marginTop: "2rem", padding: "1rem", background: darkMode ? "#1a1a1a" : "#f5f5f5", borderRadius: "8px", justifyContent: "center" }} className="pagination-controls">
                  <button
                    className="btn btn-outline-sm"
                    onClick={() => handlePageChange(1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    « First
                  </button>
                  <button
                    className="btn btn-outline-sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    ‹ Previous
                  </button>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        className={`btn btn-outline-sm ${currentPage === pageNum ? "btn-primary" : ""}`}
                        onClick={() => handlePageChange(pageNum)}
                        style={{
                          minWidth: "40px",
                          fontWeight: currentPage === pageNum ? "bold" : "normal",
                        }}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  <button
                    className="btn btn-outline-sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next ›
                  </button>
                  <button
                    className="btn btn-outline-sm"
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={!pagination.hasNextPage}
                  >
                    Last »
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Task Manager. All rights reserved.</p>
          <div className="footer-divider"></div>
          <div className="footer-links">
            <Link href="/">Create Task</Link>
            <Link href="/tasks">View All Tasks</Link>
          </div>
          <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", opacity: 0.7 }}>
            Stay organized and productive
          </p>
        </div>
      </footer>
    </div>
  )
}

