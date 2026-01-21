# Frontend Application

Next.js 15 + React 19 frontend for Task Management Application.

## Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment:**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   App will be available at: http://localhost:3000

### Production Build

```bash
npm run build        # Build for production
npm start           # Start production server
```

### Docker

```bash
# Build and run
docker build -t task-management-frontend .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:5000/api \
  task-management-frontend
```

## Features

- **Create Tasks** - Form with validation (React Hook Form + Zod)
- **Task List** - Paginated view with search and filters
- **Search** - Real-time search in title and description
- **Filters** - Filter by status and priority
- **Edit Tasks** - Inline editing with optimistic updates
- **Delete Tasks** - Confirmation dialog before deletion
- **Dark Mode** - Toggle between light and dark themes
- **Responsive** - Works on mobile, tablet, and desktop
- **Accessible** - Built with Radix UI primitives

## Project Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Home page (Create Task)
│   ├── tasks/
│   │   └── page.tsx          # Tasks listing page
│   ├── layout.tsx            # Root layout with providers
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── ui/                   # Radix UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── ...               # 40+ UI components
│   └── theme-provider.tsx    # Dark mode provider
├── hooks/                    # Custom React hooks
│   ├── use-toast.ts          # Toast notifications
│   └── use-mobile.ts         # Mobile detection
├── lib/
│   └── utils.ts              # Utility functions (cn, etc.)
├── __tests__/                # Test files
│   └── components/
│       └── TaskForm.test.tsx
├── public/                   # Static assets
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── tailwind.config.ts        # Tailwind CSS config
├── next.config.mjs           # Next.js config
└── Dockerfile                # Docker configuration
```

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI primitives
- **Forms:** React Hook Form + Zod validation
- **State:** React hooks (useState, useEffect)
- **Theme:** next-themes for dark mode
- **Icons:** Lucide React
- **Testing:** Jest + React Testing Library

## Testing

```bash
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
```

Test files are in `__tests__/` directory.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` |

## Key Dependencies

**Production:**
- `next` - React framework
- `react` & `react-dom` - React library
- `@radix-ui/react-*` - Accessible UI components
- `tailwindcss` - Utility-first CSS
- `react-hook-form` - Form management
- `zod` - Schema validation
- `next-themes` - Theme management
- `lucide-react` - Icon library
- `date-fns` - Date utilities
- `sonner` - Toast notifications

**Development:**
- `typescript` - Type checking
- `eslint` - Linting
- `jest` - Testing
- `@testing-library/react` - Component testing

## Pages

### Home (/) - Create Task
- Form to create new tasks
- Fields: title, description, status, priority, due date
- Client-side validation with Zod
- Success toast notification
- Redirect to tasks list after creation

### Tasks (/tasks) - Task List
- Paginated task list (10 items per page)
- Search bar for filtering tasks
- Status filter (All, Pending, In Progress, Completed)
- Priority filter (All, Low, Medium, High)
- Edit task inline
- Delete task with confirmation
- Responsive grid layout

## UI Components

Over 40 pre-built accessible components from Radix UI:

- Forms: Button, Input, Textarea, Select, Checkbox, Radio
- Overlays: Dialog, Alert Dialog, Popover, Tooltip
- Navigation: Tabs, Accordion, Navigation Menu
- Feedback: Toast, Alert, Progress, Spinner
- Layout: Card, Separator, Scroll Area, Sheet
- And many more...

## API Integration

API calls are made using native `fetch` API:

```typescript
// Example: Fetch tasks
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/tasks?page=1&limit=10`
)
const data = await response.json()
```

## Troubleshooting

### API Connection Issues

```bash
# Make sure backend is running
cd ../backend && npm start

# Check environment variable
echo $NEXT_PUBLIC_API_URL
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Type Errors

```bash
# Check TypeScript errors
npx tsc --noEmit
```

## Responsive Breakpoints

```css
sm: 640px   /* Tablet */
md: 768px   /* Tablet landscape */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large desktop */
```

## Theme Customization

Theme colors are defined in `app/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... more theme variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark theme overrides */
}
```

