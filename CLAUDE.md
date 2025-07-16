# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LibreChat is an open-source AI chat platform providing a ChatGPT-like interface with support for multiple AI providers (OpenAI, Anthropic, Google, AWS, Azure, etc.). It's a full-stack monorepo with React frontend, Express.js backend, and MongoDB database.

## Essential Commands

### Development
```bash
# Install dependencies (npm workspaces)
npm install

# Backend development
npm run backend:dev          # Start API server with nodemon (port 3080)

# Frontend development  
npm run frontend:dev        # Start Vite dev server (port 3090 with API proxy)

# Alternative with Bun (faster)
npm run b:api:dev           # Backend with Bun
npm run b:client:dev        # Frontend with Bun
```

### Testing & Quality
```bash
# Run tests
npm run test:api            # Backend Jest tests
npm run test:client         # Frontend Jest tests
npm run e2e                # Playwright e2e tests

# Linting (uses eslint.config.mjs)
npm run lint               # Lint entire monorepo
npm run lint:fix           # Auto-fix linting issues
```

### Build & Production
```bash
# Build for production
npm run frontend           # Build client
npm run backend           # Production API server

# Docker development
docker-compose up -d       # Full stack with dependencies
```

### Utilities
```bash
npm run create-user        # CLI user management
npm run add-balance        # User balance management
npm run update            # Update dependencies with custom script
```

## Architecture

### Monorepo Structure
```
LibreChat/
├── api/                   # Express.js backend server
├── client/                # React frontend (Vite + TypeScript)
├── packages/              # Shared workspace packages
│   ├── api/              # Backend utilities and types
│   ├── data-provider/    # API client and data fetching
│   └── data-schemas/     # Mongoose models and Zod schemas
├── config/               # CLI utilities and configuration scripts
└── e2e/                  # Playwright end-to-end tests
```

### Tech Stack
- **Backend:** Node.js 20, Express.js, MongoDB (Mongoose), Redis (optional), MeiliSearch
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Radix UI, Recoil + React Query
- **Testing:** Jest (unit), Playwright (e2e)
- **Deployment:** Docker Compose, supports Bun for faster builds

### Key Files
- **`librechat.yaml`** - Main application configuration (AI endpoints, UI settings)
- **`.env`** - Environment variables (create from `.env.example`)
- **`client/vite.config.ts`** - Frontend build with proxy to API
- **`eslint.config.mjs`** - Monorepo ESLint configuration
- **`docker-compose.yml`** - Container orchestration

## Development Patterns

### API Architecture
- RESTful Express.js API with middleware-driven request processing
- Service layer pattern for business logic
- Repository pattern with Mongoose models
- Strategy pattern for authentication providers (Passport.js)
- Plugin architecture for AI client implementations

### Frontend Architecture
- Component-driven development with Radix UI primitives
- Container/Presenter pattern for data components
- Context + Hooks pattern for state management (Recoil)
- React Query for server state management
- React Hook Form + Zod for form validation

### Data Flow
Client (React Query) → Data Provider → API Routes → Services → Models (MongoDB)

### AI Provider Integration
- Custom endpoints for OpenAI-compatible APIs
- Native integrations for major providers
- Model Context Protocol (MCP) for tool integrations
- Configurable via `librechat.yaml`

## Important Notes

### Workspace Management
- Uses npm workspaces for dependency management
- Shared dependencies hoisted to root `node_modules`
- Each package has its own build configuration

### Development Ports
- Frontend dev server: 3090 (with API proxy)
- Backend API server: 3080
- MongoDB: 27017
- MeiliSearch: 7700

### Environment Setup
Copy `.env.example` to `.env` and configure required variables. The application requires MongoDB and supports optional Redis caching and MeiliSearch for conversation search.

### File Storage
Supports local file storage, AWS S3, or Firebase for user uploads and attachments.