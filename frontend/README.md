# Eidolon Frontend

Modern React application for the Eidolon manufacturing intelligence platform.

## Architecture

- **Framework:** React + Vite
- **Routing:** TanStack Router (File-based routing)
- **State/Data:** TanStack Query + tRPC Client
- **Styling:** Tailwind CSS + Shadcn UI
- **Animation:** Framer Motion
- **Forms:** React Hook Form + Zod
- **Testing:** Vitest + React Testing Library

## Getting Started

### Prerequisites
- Node.js
- pnpm
- Backend server running (for API calls)

### Key Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run unit tests
pnpm test

# Run Storybook
pnpm storybook
```

## Project Structure

- `src/routes`: File-based routes (TanStack Router)
- `src/components`: Reusable UI components
- `src/lib`: Utilities and helpers
- `src/trpc.ts`: tRPC client configuration
