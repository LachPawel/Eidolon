# Project Eidolon

### Overview

The core idea is to create a platform for managing various articles across different industries. Companies should have the availability to define and configure their own articles as these can vary significantly between industries. 

This case includes defining additional fields specific to their needs, on all articles, individual, or groups of articles.

On the other side, we have the shop floor where these articles are produced. Here, the focus is on providing a user-friendly interface for operators to efficiently manage and track the production of these articles.

### The Story

This repo will be divided into various branches, each representing a different chapter of the story. Each chapter will introduce new features, challenges, and solutions as we progress through the development of the project. Starting from a very basic setup, we will gradually build up the complexity and functionality of the application. To include the tool only when needed, each chapter will be merged into the main branch upon completion. This way, the main branch will always represent the current state of the project, while the individual branches will serve as a record of our journey through the development process.

### Chapters (Work in Progress)

- Chapter 0: Setting up the Backend with Express
    - Initialize a basic Express server.
    - Create an endpoint to fetch articles.

- Chapter 1: The Foundation - Implementing Basic Article Management
    - Add CRUD operations for articles.
    - Introduce data validation for article fields.
    - Store articles in a JSON file.
    - Create simple frontend to add articles, and new entries for articles (Shop Floor)
    - Implement TypeScript for type safety.
    - Arrange the project in the MVC pattern

- Chapter 2: The Persistence - Integrating a Database and testing the grounds
    - Set up a PostgreSQL database.
    - Use Drizzle ORM to interact with the database.
    - Update CRUD operations to use the database.
    - Write unit and integration tests for backend functionalities.
    - Create Docker setup for local development and testing.

- Chapter 3: The Normalization - Redesigning the Database Schema
    - Design a normalized schema to avoid data duplication data integrity and scalability, by removing jsonb fields.
    - Update backend code to work with the normalized schema.
    - Ensure all tests pass with the new schema.
    - Add endpoint to fetch entries for a specific article.

- Chapter 4: The Seed - Generating Realistic Test Data
    - Implement a seeding script to populate the database with realistic test data.
    - Use Faker.js to generate diverse and meaningful data.
    - Create industry templates to define common fields for articles in specific industries.
    - Update tests to utilize the seeded data.

- Chapter 5: The Cleanup - ESLint, Prettier, and Husky Integration
    - Set up ESLint and Prettier for code formatting and linting.
    - Integrate Husky to run linting and formatting checks before commits.
    - Ensure the entire codebase adheres to the defined coding standards.

- Chapter 6: The Frontend - Building a User Interface with Vite and React
    - Set up a frontend project using Vite and React.
    - Create components to display and manage articles.
    - Implement forms for adding and editing articles.
    - Connect the frontend to the backend API with tRPC.

- Chapter 7: The Book Cover - Improving UI/UX with Tailwind CSS and 21st.dev
    - Design a responsive and user-friendly interface.
    - Enhance user experience with animations and transitions.
    - Enable editing of article entries directly from the frontend.

- Chapter 8: The Performance - Implementing Advanced Search with Algolia and Pinecone
    - Integrate Algolia for fast text-based search.
    - Implement Pinecone for semantic search capabilities.
    - Compare performance between PostgreSQL, Algolia, and Pinecone.
    - Provide AI-powered field suggestions based on similar articles.

- Chapter 9: The Migration - Database Migrations with Drizzle Kit
    - Create migration scripts for schema changes.
    - Implement a versioning system for the database schema.

- Chapter 10: The Storybook - Documenting Components with Storybook
    - Set up Storybook for the frontend project.
    - Create stories for all major components.
    - Use Storybook as a development environment for UI components.

- Chapter 11: The Production Page - Dashboard for Monitoring and Scheduling
    - Build a dashboard to monitor article production.
    - Implement scheduling features for article entries.

### Tech Stack (Work in Progress)

- Backend: Node.js with Express, TypeScript, Drizzle ORM, PostgreSQL, Docker, Vitest and Supertest for testing, Faker.js for data generation, ESLint, Prettier, Husky for code quality, tRPC, OpenAI, Algolia, Pinecone
- Frontend: Vite, React, TypeScript, tRPC, Tailwind CSS, ESLint, Prettier, Husky, Storybook

### Requirements (Tested on macOS)

- Node.js v22+
- Docker

### Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install` (or `npm install` if pnpm is not available)
3. Configure environment variables:
   - Backend: Create a `.env` file in the `backend` directory based on `.env.example`
   - Frontend: The `.env.development` file is already provided for local development
4. Set up the database: `pnpm run db:setup` (or `cd backend && npm run db:setup`)
5. Seed the database with initial data: `pnpm run db:seed`
6. Start the development servers: `pnpm dev`
   - Backend API: `http://localhost:3000`
   - Frontend: `http://localhost:5173`
7. Clean the database: `pnpm run db:clean`

### Testing

1. Create a `.env.test` file in the `backend` directory based on `.env.example` with test database credentials
2. Set up the test database: `pnpm run test:db:reset`
3. Seed the test database: `pnpm run test:db:seed`
4. Run tests:
   - All tests: `pnpm test`
   - Unit tests only: `pnpm run test:unit`
   - Integration tests only: `pnpm run test:integration`
5. Clean up test database: `pnpm run test:db:clean`
