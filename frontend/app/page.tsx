"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import "./page.css"

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

export default function Page() {
  // Always start with false to match server render (prevents hydration error)
  const [darkMode, setDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("pending")
  const [priority, setPriority] = useState("medium")
  const [dueDate, setDueDate] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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

  // Add task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!title.trim()) {
      setError("Title is required")
      return
    }
    if (title.length > 100) {
      setError("Title must not exceed 100 characters")
      return
    }

    setLoading(true)
    const startTime = Date.now()
    const minLoadingTime = 800 // Minimum 800ms to show loader
    
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, status, priority, dueDate }),
      })

      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime)

      if (response.ok) {
        // Wait for minimum loading time before showing success
        await new Promise(resolve => setTimeout(resolve, remainingTime))
        
        setTitle("")
        setDescription("")
        setStatus("pending")
        setPriority("medium")
        setDueDate("")
        setSuccess("Task created successfully! View all tasks to see it.")
        setTimeout(() => setSuccess(""), 5000)
      } else {
        const err = await response.json()
        setError(err.error || "Failed to create task")
        // Wait for minimum loading time even on error
        await new Promise(resolve => setTimeout(resolve, remainingTime))
      }
    } catch (error) {
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime)
      setError("Error creating task. Make sure backend is running.")
      // Wait for minimum loading time even on error
      await new Promise(resolve => setTimeout(resolve, remainingTime))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`app ${darkMode ? "dark-mode" : ""}`}>
      <header className="app-header">
        <div className="header-content">
          <h1>Task Manager</h1>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <Link href="/tasks" className="btn btn-outline">
              View All Tasks →
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
        {/* Create Task Form */}
        <section className="form-section" style={{ maxWidth: "600px", margin: "0 auto" }}>
          <form className="task-form" onSubmit={handleAddTask}>
            <h2>Create New Task</h2>

            {error && <div className="form-error">{error}</div>}
            {success && (
              <div className="form-success">
                {success}
                <Link href="/tasks" style={{ marginLeft: "0.5rem", textDecoration: "underline" }}>
                  View all tasks
                </Link>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="title">Task Title *</label>
              <input
                id="title"
                type="text"
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                disabled={loading}
                className="form-input"
              />
              <small>{title.length}/100</small>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                placeholder="Enter task description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                className="form-input form-textarea"
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={loading}
                  className="form-input"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  disabled={loading}
                  className="form-input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={loading}
                className="form-input"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="btn btn-primary"
              style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                gap: "0.75rem",
                minHeight: "48px",
                fontSize: "1rem",
                fontWeight: "600",
                position: "relative",
                opacity: loading ? 0.95 : 1,
                transition: "all 0.2s"
              }}
            >
              {loading && (
                <div 
                  className="spinner-green"
                  style={{
                    width: "22px",
                    height: "22px",
                    borderWidth: "3px"
                  }}
                ></div>
              )}
              <span style={{ display: "flex", alignItems: "center" }}>
                {loading ? "Creating Task..." : "Create Task"}
              </span>
            </button>
          </form>

          <div style={{ marginTop: "2rem", textAlign: "center", padding: "1.5rem", background: darkMode ? "#1a1a1a" : "#f5f5f5", borderRadius: "8px" }}>
            <p style={{ marginBottom: "1rem", color: darkMode ? "#ccc" : "#666" }}>
              Want to view, filter, or manage all your tasks?
            </p>
            <Link href="/tasks" className="btn btn-outline">
              View All Tasks with Pagination →
            </Link>
          </div>
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
