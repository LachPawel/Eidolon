# Eidolon Backend

Node.js/Express server powering the Eidolon manufacturing intelligence platform.

## Architecture

- **Runtime:** Node.js
- **Framework:** Express
- **API:** tRPC (Type-safe APIs)
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Validation:** Zod
- **Testing:** Mocha & Chai

## Getting Started

### Prerequisites
- Node.js
- Docker (for database)
- pnpm

### Key Commands

```bash
# Start development server
pnpm dev

# Database Setup (Start container & push schema)
pnpm db:setup

# Seed Database
pnpm db:seed

# Run Tests
pnpm test
```

## Project Structure

- `src/routers`: tRPC router definitions
- `src/controllers`: Business logic
- `src/db`: Drizzle schema and connection
- `src/seeds`: Database seeding scripts
