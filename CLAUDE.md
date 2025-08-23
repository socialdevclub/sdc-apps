# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SDC-STOCK is a real-time stock trading game platform built as a monorepo using React (frontend) and NestJS (backend). The project provides interactive party games focused on stock market simulation with real-time multiplayer capabilities.

## Development Commands

### Essential Commands
```bash
# Install dependencies (uses Yarn 4)
yarn install

# Run lint across all packages
yarn lint

# Frontend development (koi-client)
cd app/koi-client
yarn dev                    # Start development server
yarn build                  # Production build
yarn test                   # Run Vitest tests

# Backend development (koi-server)
cd app/koi-server
yarn dev                    # Start development server with watch mode
yarn build                  # Build for Lambda deployment
yarn test                   # Run Jest tests
yarn test:e2e               # Run end-to-end tests
```

## Architecture & Code Organization

### Monorepo Structure
- **app/**: Main applications
  - `koi-client`: React frontend with Vite, Emotion, Tanstack Query, Jotai, Socket.IO
  - `koi-server`: NestJS backend with MongoDB, DynamoDB, Socket.IO, AWS Lambda
  - `sdc-ai-server`: AI service for OpenAI integration
  - `sdc-discord-server`: Discord bot service
  
- **package/**: Shared code
  - `feature/`: Feature modules (`feature-nest-poll`, `feature-nest-stock`)
  - `library/`: Utilities (`lib-dayjs`, `lib-nest-socket`, `lib-nest-sqs`, `lib-react-query`)
  - `shared/`: Shared types and configs (`type`, `type-koi`, `type-party`, `type-poll`, `type-stock`)

### Frontend (koi-client) Patterns
- **Pages**: Located in `src/page/` with `@` prefix convention for route components
- **Components**: `src/component/` for feature components, `src/component-presentation/` for pure UI
- **State Management**: Jotai atoms in `src/store/`
- **Hooks**: Custom hooks in `src/hook/` organized by feature (e.g., `hook-stock/`, `hook-party/`)
- **API Calls**: Tanstack Query hooks for data fetching
- **Real-time**: Socket.IO integration for live updates

### Backend (koi-server) Patterns
- **Module Architecture**: NestJS modules with Controller/Service/Repository pattern
- **Database**: MongoDB (Mongoose) for primary data, DynamoDB for stock game data
- **Real-time**: Socket.IO gateways for WebSocket communication
- **Feature Modules**: Separated as packages (`feature-nest-poll`, `feature-nest-stock`)
- **Error Handling**: Centralized exception filters and logging

### Key Technical Details
- **Authentication**: Supabase-based auth with profile management
- **Real-time Game State**: Socket.IO events for stock price updates and game phases
- **Stock Game Phases**: waiting → playing → results cycle
- **Party System**: Room-based multiplayer with host/player roles
- **Testing**: Vitest (frontend), Jest (backend), Playwright (E2E mobile-focused)
- **Build System**: Turbo for monorepo optimization, Vite for frontend, Webpack for Lambda

### Database Schema Locations
- MongoDB schemas: `app/koi-server/src/*/schema/*.schema.ts`
- DynamoDB schemas: `package/feature/feature-nest-stock/src/repository/*.repository.ts`

### Environment Configuration
- Uses `local.socialdev.club` for local development (CORS handling)
- Requires AWS SSO configuration for DynamoDB access
- Environment variables managed through `.env` files

## Important Development Notes

- The project uses Yarn 4 with workspaces - always use `yarn` instead of `npm`
- TypeScript strict mode is enabled - avoid using `any` type
- ESLint is configured with Airbnb style guide - run `yarn lint` before committing
- Mobile-first development approach - test on mobile viewport sizes
- Real-time features require Socket.IO server running alongside HTTP server
- Stock game data uses DynamoDB - ensure AWS credentials are configured
- Frontend routes use lazy loading for better performance