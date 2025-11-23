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

- Chapter 1: Implementing Article Management
    - Add CRUD operations for articles.
    - Introduce data validation for article fields.
    - Store articles in a JSON file.
    - Create simple frontend to add articles, and new entries for articles (Shop Floor)
    - Implement TypeScript for type safety.
    - Arrange the project in the MVC pattern.

### Tech Stack (Work in Progress)

- Backend: Node.js with Express, TypeScript

### Getting Started

1. Clone the repository
2. Navigate to the backend directory: `cd backend`
3. Install dependencies: `npm install`
4. Build the project: `npm run build`
5. Start the server: `npm start` or `npm run dev` for development mode
6. Access the application at `http://localhost:3000`