# AI Interview Preparation App

This repository contains the monorepo for the AI Interview Preparation App. It is divided into two main parts:
- **Frontend:** Built with Next.js (App Router), TypeScript, and Tailwind CSS.
- **Backend:** Built with Spring Boot (Java 17) and Maven.

## Prerequisites
- Node.js (v18 or higher recommended)
- Java 17
- Maven 3.8+

## Running the Backend

The backend is a Spring Boot application built with Maven.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Build the project and install dependencies:
   ```bash
   mvn clean install
   ```
3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   The backend API will start on `http://localhost:8080`.

### Backend Project Structure
- `com.interviewprep.app.controller`: Contains REST API endpoints.
- `com.interviewprep.app.service`: Contains business logic.
- `com.interviewprep.app.dto`: Contains Data Transfer Objects (e.g., standard API responses).
- `com.interviewprep.app.config`: Contains configuration classes (e.g., CORS setup).

## Running the Frontend

The frontend is a Next.js application using the App Router.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend application will start on `http://localhost:3000`.

### Features
- **Next.js 16 (App Router):** Modern React framework features.
- **TypeScript:** Fully typed codebase for reliability.
- **Tailwind CSS:** Utility-first styling.
