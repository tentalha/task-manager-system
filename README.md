# Task Management System

A full-stack task management application built with Next.js, Express.js, and MongoDB.

## Features

- Create, read, update, and delete tasks
- Search tasks by title or description
- Filter tasks by status and priority
- Pagination support
- Dark mode support
- Responsive design
- Docker support for easy deployment

## Architecture

```
Task-manager-system/
├── frontend/           # Next.js frontend application
├── backend/            # Express.js backend API
├── docker-compose.yml  # Docker orchestration
└── DOCKER_SETUP.md     # Docker setup guide
```

### Tech Stack

**Frontend:**
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Radix UI Components
- React Hook Form with Zod validation

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- CORS support
- REST API

**DevOps:**
- Docker & Docker Compose
- Jest for testing

## Quick Start

### Prerequisites

- Node.js 20+ 
- MongoDB 7.0+ (or use Docker)
- npm or yarn

### Option 1: Run with Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd Task-manager-system

# Start all services with Docker
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- MongoDB: localhost:27017

### Option 2: Run Locally

#### 1. Start MongoDB

Make sure MongoDB is running on `mongodb://localhost:27017`

#### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env  # Create .env file
npm start
```

Backend runs on http://localhost:5000

#### 3. Setup Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local  # Create .env.local file
npm run dev
```

Frontend runs on http://localhost:3000

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Get All Tasks
```http
GET /api/tasks
```

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10, max: 100) - Items per page
- `status` (string) - Filter by status: `pending`, `in-progress`, `completed`
- `priority` (string) - Filter by priority: `low`, `medium`, `high`
- `search` (string) - Search in title and description
- `sortBy` (string, default: `createdAt`) - Sort field
- `order` (string, default: `desc`) - Sort order: `asc` or `desc`

**Response:**
```json
{
  "tasks": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

#### Get Single Task
```http
GET /api/tasks/:id
```

#### Create Task
```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Task title",
  "description": "Task description",
  "status": "pending",
  "priority": "medium",
  "dueDate": "2025-12-31T23:59:59.000Z"
}
```

#### Update Task
```http
PATCH /api/tasks/:id
Content-Type: application/json

{
  "title": "Updated title",
  "status": "completed"
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
```

## Testing

### Backend Tests
```bash
cd backend
npm test                # Run tests once
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage
```

### Frontend Tests
```bash
cd frontend
npm test                # Run tests once
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage
```

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/taskmanagement
PORT=5000
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Docker Commands

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Rebuild and start
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Project Structure

### Backend
```
backend/
├── server.js           # Express server and routes
├── package.json        # Dependencies
├── Dockerfile          # Docker configuration
├── jest.config.js      # Jest test configuration
└── __tests__/          # Test files
    └── api/
        └── tasks.test.js
```

### Frontend
```
frontend/
├── app/                # Next.js app directory
│   ├── page.tsx        # Home page (Create Task)
│   ├── tasks/          # Tasks listing page
│   ├── layout.tsx      # Root layout
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── ui/             # Radix UI components
│   └── theme-provider.tsx
├── lib/                # Utility functions
├── hooks/              # Custom React hooks
├── __tests__/          # Test files
├── package.json        # Dependencies
├── Dockerfile          # Docker configuration
└── next.config.mjs     # Next.js configuration
```

## Task Schema

```javascript
{
  title: String,        // Required, max 100 chars
  description: String,  // Optional
  status: String,       // 'pending' | 'in-progress' | 'completed'
  priority: String,     // 'low' | 'medium' | 'high'
  dueDate: Date,        // Optional
  createdAt: Date,      // Auto-generated
  updatedAt: Date       // Auto-updated
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Troubleshooting

### MongoDB Connection Issues

If you see MongoDB connection errors:

1. **Local MongoDB**: Make sure MongoDB is running
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

2. **Docker**: Make sure MongoDB container is running
   ```bash
   docker-compose ps
   docker-compose logs mongodb
   ```

### Port Already in Use

If ports 3000 or 5000 are already in use:

1. Stop the process using the port
2. Or change ports in `docker-compose.yml` and environment variables

### Docker Build Fails

1. Make sure Docker Desktop is running
2. Clean Docker cache:
   ```bash
   docker system prune -a
   docker-compose build --no-cache
   ```

## Support

For issues and questions, please open an issue on GitHub.
