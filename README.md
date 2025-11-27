<div align="center">
  <img src="frontend/public/layers.svg" alt="Eidolon Logo" width="120" height="120" />
  <h1>Eidolon</h1>
  <p>
    <strong>A Next-Generation Manufacturing Execution System (MES)</strong>
  </p>
  <p>
    <a href="https://eidolon-frontend.up.railway.app">View Demo</a>
    ·
    <a href="#features">Features</a>
    ·
    <a href="#architecture">Architecture</a>
  </p>
</div>

---

[![Storybook](https://raw.githubusercontent.com/storybookjs/brand/master/badge/badge-storybook.svg)](https://69285fb878dfda69d1a3ef3b-blncxymmov.chromatic.com/)
[![Frontend Tests](https://github.com/LachPawel/Eidolon/actions/workflows/frontend-tests.yml/badge.svg)](https://github.com/LachPawel/Eidolon/actions/workflows/frontend-tests.yml)
[![Backend Tests](https://github.com/LachPawel/Eidolon/actions/workflows/backend-tests.yml/badge.svg)](https://github.com/LachPawel/Eidolon/actions/workflows/backend-tests.yml)

## Overview

Eidolon is a comprehensive platform designed to bridge the gap between production planning and shop floor execution. It allows organizations to define complex, industry-specific articles with dynamic fields and manage their production lifecycle through an intuitive interface.

By leveraging modern technologies like **AI-driven insights**, **vector search**, and **real-time updates**, Eidolon empowers manufacturers to optimize their workflows, identify bottlenecks, and ensure consistent quality across all production lines.

## Key Features

-   **Dynamic Article Management**: Define articles with custom fields (text, number, boolean, select) tailored to specific industry needs.
-   **Shop Floor Interface**: A streamlined, touch-friendly interface for operators to track production progress and update statuses in real-time.
-   **AI Production Hints**: Integrated OpenAI analysis provides actionable insights and identifies potential bottlenecks based on current production states.
-   **Advanced Search**: Powered by Algolia and Pinecone, enabling fast text-based and semantic search across large inventories.
-   **Production Dashboard**: Visual overview of production schedules, performance metrics, and active jobs.

## Architecture

Eidolon follows a modern, scalable architecture separating concerns between a responsive frontend and a robust backend API.

### How It Works

1.  **Definition**: Managers define **Articles** and their specific **Field Definitions** (attributes) in the system.
2.  **Planning**: Production orders are created as **Entries**, scheduled for specific time slots.
3.  **Execution**: Operators on the **Shop Floor** view their assigned tasks, update progress (Preparation -> In Production -> Ready), and input quality data.
4.  **Optimization**: The system analyzes production data in real-time, offering **AI Hints** to improve efficiency and **Search** capabilities to quickly retrieve historical data.

## Screenshots

### Article Management

### Production Dashboard

### Shop Floor Interface

## Tech Stack

-   **Frontend**: React, Vite, TypeScript, Tailwind CSS, TanStack Router, Framer Motion, Storybook.
-   **Backend**: Node.js, Express, tRPC, Drizzle ORM, PostgreSQL, OpenAI, Algolia, Pinecone.
-   **DevOps**: Docker, Railway, GitHub Actions.

## Development Journey (Chapters)

This repo is divided into various branches, each representing a different chapter of the story. Each chapter introduces new features, challenges, and solutions.

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

- Chapter 12: The Deployment - Deploying the Application
    - Set up CI/CD pipelines for automated testing and deployment.
    - Deploy the backend and frontend to a railway.app
    - Chromatic integration for Storybook deployment.

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

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes. Make sure to follow the coding standards and include tests for any new features or bug fixes.

### Testing

1. Create a `.env.test` file in the `backend` directory based on `.env.example` with test database credentials
2. Set up the test database: `pnpm run test:db:reset`
3. Seed the test database: `pnpm run test:db:seed`
4. Run tests:
   - All tests: `pnpm test`
   - Unit tests only: `pnpm run test:unit`
   - Integration tests only: `pnpm run test:integration`
5. Clean up test database: `pnpm run test:db:clean`