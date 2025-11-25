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
- **Search:** Algolia (fast text search), Pinecone (semantic search)
- **AI:** OpenAI Embeddings for similarity search and field suggestions

## Features

### Search & Performance
- **Fast Text Search:** Algolia integration for typo-tolerant, instant search (~5-20ms)
- **Semantic Search:** Pinecone vector similarity for intelligent article matching
- **AI Field Hints:** Automatic field suggestions based on similar articles
- **Performance Monitoring:** Built-in metrics comparing PostgreSQL, Algolia, and Pinecone

### API Endpoints (tRPC)
- `articles.list` - List articles with PostgreSQL (tracked for performance)
- `articles.fastSearch` - Search with Algolia
- `articles.semanticSearch` - Semantic search with Pinecone
- `articles.getAIHints` - Get AI-powered field suggestions
- `articles.getValidationHint` - Get validation hints based on material type
- `articles.getSearchPerformance` - Compare search backend performance
- `articles.getBenchmarkReport` - Get detailed performance report

## Getting Started

### Prerequisites
- Node.js
- Docker (for database)
- pnpm

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Required
DATABASE_URL="postgresql://..."

# Optional - Search Services
ALGOLIA_APP_ID="your_algolia_app_id"
ALGOLIA_ADMIN_KEY="your_algolia_admin_key"
PINECONE_API_KEY="your_pinecone_api_key"
OPENAI_API_KEY="your_openai_api_key"
```

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

# Run performance comparison tests
pnpm test:integration -- --grep "Performance"
```

## Project Structure

- `src/routers`: tRPC router definitions
- `src/controllers`: Business logic
- `src/db`: Drizzle schema and connection
- `src/seeds`: Database seeding scripts
- `src/services`: External service integrations (Algolia, Pinecone, Performance)
