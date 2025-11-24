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

### Tech Stack (Work in Progress)

- Backend: Node.js with Express, TypeScript, Drizzle ORM, PostgreSQL, Docker, Chai/Mocha and Supertest for testing, Faker.js for data generation

### Requirements (Tested on macOS)

- Node.js v22+
- Docker

### Getting Started

1. Clone the repository
2. Navigate to the backend directory: `cd backend`
3. Install dependencies: `npm install`
4. Build the project: `npm run build`
5. Start the server: `npm start` or `npm run dev` for development mode
6. Create a `.env` file based on the `.env.example` in the root directory and backend directory to configure your environment variables.
7. Set up the database by running: `npm run db:setup`
8. Seed the database with initial data: `npm run db:seed`
9. Access the application at `http://localhost:3000`
10. Clean the database by running: `npm run db:clean`

### Testing

0. Create a `.env.test` file based on the `.env.example` and configure your test environment variables.
1. Ensure the test database is set up by running: `npm run test:db:reset`
2. Seed the test database with initial data: `npm run test:db:seed`
3. Run tests using: `npm test` for all tests, `npm run test:unit` for unit tests, or `npm run test:integration` for integration tests.
4. Clean up the test database by running: `npm run test:db:clean`