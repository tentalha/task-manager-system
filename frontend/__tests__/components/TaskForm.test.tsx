/**
 * Unit Tests for Task Form Component
 * 
 * What are Component Unit Tests?
 * Component tests verify that React components:
 * - Render correctly
 * - Handle user interactions (clicks, typing)
 * - Display correct data
 * - Show error/success messages
 * - Validate input properly
 * 
 * These tests use React Testing Library which:
 * - Tests components like users interact with them
 * - Encourages accessible code
 * - Focuses on behavior, not implementation
 * 
 * To run these tests:
 * npm test
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock the form component (simplified version for testing)
const TaskForm = ({ onSubmit, loading = false }) => {
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [priority, setPriority] = React.useState('medium')
  const [error, setError] = React.useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (title.length > 100) {
      setError('Title must not exceed 100 characters')
      return
    }
    setError('')
    onSubmit({ title, description, priority })
  }

  return (
    <form onSubmit={handleSubmit} data-testid="task-form">
      <div>
        <label htmlFor="title">Task Title *</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          disabled={loading}
          data-testid="title-input"
        />
        <small data-testid="char-count">{title.length}/100</small>
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          data-testid="description-input"
        />
      </div>

      <div>
        <label htmlFor="priority">Priority</label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          disabled={loading}
          data-testid="priority-select"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {error && <div data-testid="error-message">{error}</div>}

      <button type="submit" disabled={loading} data-testid="submit-button">
        {loading ? 'Creating...' : 'Create Task'}
      </button>
    </form>
  )
}

describe('TaskForm Component', () => {
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  // Test 1: Form renders correctly
  describe('Rendering', () => {
    it('should render all form fields', () => {
      render(<TaskForm onSubmit={mockOnSubmit} />)

      expect(screen.getByLabelText(/task title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    })

    it('should show character counter', () => {
      render(<TaskForm onSubmit={mockOnSubmit} />)
      expect(screen.getByTestId('char-count')).toHaveTextContent('0/100')
    })

    it('should display loading state', () => {
      render(<TaskForm onSubmit={mockOnSubmit} loading={true} />)
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Creating...')
      expect(screen.getByTestId('submit-button')).toBeDisabled()
    })
  })

  // Test 2: Form validation
  describe('Validation', () => {
    it('should show error when title is empty', async () => {
      render(<TaskForm onSubmit={mockOnSubmit} />)

      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Title is required')
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should show error when title exceeds 100 characters', async () => {
      render(<TaskForm onSubmit={mockOnSubmit} />)

      const titleInput = screen.getByTestId('title-input')
      const longTitle = 'a'.repeat(101)
      
      fireEvent.change(titleInput, { target: { value: longTitle } })
      
      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Title must not exceed 100 characters')
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should update character counter as user types', () => {
      render(<TaskForm onSubmit={mockOnSubmit} />)

      const titleInput = screen.getByTestId('title-input')
      fireEvent.change(titleInput, { target: { value: 'Test Task' } })

      expect(screen.getByTestId('char-count')).toHaveTextContent('9/100')
    })
  })

  // Test 3: Form submission
  describe('Submission', () => {
    it('should call onSubmit with form data when valid', async () => {
      render(<TaskForm onSubmit={mockOnSubmit} />)

      const titleInput = screen.getByTestId('title-input')
      const descriptionInput = screen.getByTestId('description-input')
      const prioritySelect = screen.getByTestId('priority-select')
      const submitButton = screen.getByTestId('submit-button')

      fireEvent.change(titleInput, { target: { value: 'New Task' } })
      fireEvent.change(descriptionInput, { target: { value: 'Task description' } })
      fireEvent.change(prioritySelect, { target: { value: 'high' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'New Task',
          description: 'Task description',
          priority: 'high'
        })
      })
    })

    it('should not submit when form is invalid', async () => {
      render(<TaskForm onSubmit={mockOnSubmit} />)

      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  // Test 4: User interactions
  describe('User Interactions', () => {
    it('should allow user to type in title field', () => {
      render(<TaskForm onSubmit={mockOnSubmit} />)

      const titleInput = screen.getByTestId('title-input')
      fireEvent.change(titleInput, { target: { value: 'My Task' } })

      expect(titleInput).toHaveValue('My Task')
    })

    it('should allow user to change priority', () => {
      render(<TaskForm onSubmit={mockOnSubmit} />)

      const prioritySelect = screen.getByTestId('priority-select')
      fireEvent.change(prioritySelect, { target: { value: 'high' } })

      expect(prioritySelect).toHaveValue('high')
    })

    it('should disable inputs when loading', () => {
      render(<TaskForm onSubmit={mockOnSubmit} loading={true} />)

      expect(screen.getByTestId('title-input')).toBeDisabled()
      expect(screen.getByTestId('description-input')).toBeDisabled()
      expect(screen.getByTestId('priority-select')).toBeDisabled()
    })
  })
})

