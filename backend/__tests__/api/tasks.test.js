/**
 * Unit Tests for Task API Endpoints
 * 
 * What are Unit Tests?
 * Unit tests are automated tests that verify individual units (functions, methods, endpoints) 
 * of your code work correctly in isolation. They:
 * - Test one thing at a time
 * - Run fast (no database/network calls unless mocked)
 * - Help catch bugs early
 * - Serve as documentation for how code should work
 * - Make refactoring safer
 * 
 * To run these tests:
 * npm test
 * npm run test:watch (for auto-rerun)
 * npm run test:coverage (for coverage report)
 */

import request from 'supertest'
import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import taskRoutes from '../../routes/taskRoutes.js'
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler.js'
import Task from '../../models/Task.js'

// Load environment variables
dotenv.config()

// Test Express app
let app

beforeAll(async () => {
  // Create a test Express app
  app = express()
  app.use(cors())
  app.use(express.json())
  
  // Connect to test database
  if (mongoose.connection.readyState === 0) {
    const testDbUri = process.env.MONGODB_URI?.replace('taskmanagement', 'taskmanagement_test') || 'mongodb://localhost:27017/taskmanagement_test'
    await mongoose.connect(testDbUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
  }
  
  // Use actual routes (modular structure)
  app.use('/api/tasks', taskRoutes)
  
  // Error handlers
  app.use(notFoundHandler)
  app.use(errorHandler)
})

afterAll(async () => {
  // Clean up: close database connection
  await mongoose.connection.close()
})

afterEach(async () => {
  // Clean up: delete all tasks after each test
  if (Task) {
    await Task.deleteMany({})
  }
})

describe('Task API Endpoints', () => {
  let createdTaskId

  // Test 1: Create a new task (POST /api/tasks)
  describe('POST /api/tasks', () => {
    it('should create a new task with valid data', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'This is a test task',
        status: 'pending',
        priority: 'high'
      }

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body.title).toBe(taskData.title)
      expect(response.body.description).toBe(taskData.description)
      expect(response.body.status).toBe(taskData.status)
      expect(response.body.priority).toBe(taskData.priority)
      
      createdTaskId = response.body._id
    })

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ description: 'No title' })
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Title is required')
    })

    it('should return 400 if title exceeds 100 characters', async () => {
      const longTitle = 'a'.repeat(101)
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: longTitle })
        .expect(400)

      expect(response.body.error).toContain('Title must not exceed 100 characters')
    })

    it('should create task with default values if optional fields are missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Minimal Task' })
        .expect(201)

      expect(response.body.status).toBe('pending')
      expect(response.body.priority).toBe('medium')
      expect(response.body.description).toBe('')
    })
  })

  // Test 2: Get all tasks (GET /api/tasks)
  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })

    it('should filter tasks by status', async () => {
      // Create a pending task first
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Pending Task', status: 'pending' })

      const response = await request(app)
        .get('/api/tasks?status=pending')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      if (response.body.length > 0) {
        response.body.forEach(task => {
          expect(task.status).toBe('pending')
        })
      }
    })

    it('should filter tasks by priority', async () => {
      // Create a high priority task first
      await request(app)
        .post('/api/tasks')
        .send({ title: 'High Priority Task', priority: 'high' })

      const response = await request(app)
        .get('/api/tasks?priority=high')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      if (response.body.length > 0) {
        response.body.forEach(task => {
          expect(task.priority).toBe('high')
        })
      }
    })

    it('should search tasks by title', async () => {
      // Create a task with specific title
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Searchable Task' })

      const response = await request(app)
        .get('/api/tasks?search=Searchable')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })
  })

  // Test 3: Get single task (GET /api/tasks/:id)
  describe('GET /api/tasks/:id', () => {
    it('should return a task by id', async () => {
      // Create a task first
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task for Get Test' })
        .expect(201)
      
      const taskId = createResponse.body._id

      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(200)

      expect(response.body).toHaveProperty('_id')
      expect(response.body._id.toString()).toBe(taskId.toString())
    })

    it('should return 404 if task not found', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      const response = await request(app)
        .get(`/api/tasks/${fakeId}`)
        .expect(404)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Task not found')
    })
  })

  // Test 4: Update task (PATCH /api/tasks/:id)
  describe('PATCH /api/tasks/:id', () => {
    it('should update task status', async () => {
      // Create a task first
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task for Update Test' })
        .expect(201)
      
      const taskId = createResponse.body._id

      const response = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .send({ status: 'in-progress' })
        .expect(200)

      expect(response.body.status).toBe('in-progress')
    })

    it('should update task title', async () => {
      // Create a task first
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task for Update Test' })
        .expect(201)
      
      const taskId = createResponse.body._id

      const response = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .send({ title: 'Updated Title' })
        .expect(200)

      expect(response.body.title).toBe('Updated Title')
    })

    it('should return 400 if title is empty', async () => {
      // Create a task first
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task for Update Test' })
        .expect(201)
      
      const taskId = createResponse.body._id

      const response = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .send({ title: '' })
        .expect(400)

      expect(response.body.error).toContain('Title cannot be empty')
    })

    it('should return 400 if status is invalid', async () => {
      // Create a task first
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task for Update Test' })
        .expect(201)
      
      const taskId = createResponse.body._id

      const response = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .send({ status: 'invalid-status' })
        .expect(400)

      expect(response.body.error).toContain('Status must be one of')
    })

    it('should return 404 if task not found', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      const response = await request(app)
        .patch(`/api/tasks/${fakeId}`)
        .send({ status: 'completed' })
        .expect(404)

      expect(response.body.error).toBe('Task not found')
    })
  })

  // Test 5: Delete task (DELETE /api/tasks/:id)
  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      // Create a task to delete
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task to Delete' })
        .expect(201)
      
      const taskId = createResponse.body._id

      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .expect(200)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toBe('Task deleted successfully')
    })

    it('should return 404 if task not found', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      const response = await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .expect(404)

      expect(response.body.error).toBe('Task not found')
    })
  })
})
