# UniVoyage Project Overview

**UniVoyage** is a modern full-stack travel planning platform focused on students and budget-aware travelers.

## What the project does

UniVoyage combines:
- trip creation and management
- budget planning and tracking
- destination discovery
- weather and map context
- AI itinerary and packing suggestions
- admin CMS flows

## Main user-facing capabilities

- **Trip Builder**
  - create/edit trips by destination and date range
- **Budget Management**
  - track spending by categories
- **Student-Friendly Hotels**
  - Amadeus integration
- **Weather Forecast**
  - OpenWeather integration
- **Points of Interest + Maps**
  - Geoapify + OpenStreetMap
- **AI Assistance**
  - Google Gemini itinerary/packing/recommendation features
- **User Profile**
  - preferences, visited countries, personalization
- **Admin CMS**
  - destination/user/review management

## Security and auth model

- JWT-based auth (with cookie/session support in current implementation)
- Google OAuth2 login
- role-based access
- centralized exception handling

## External APIs

- OpenWeather
- Geoapify
- Amadeus
- OpenStreetMap
- Google Gemini

## Tech stack

### Backend
- Java 23
- Spring Boot
- Spring Security
- JPA / Hibernate
- Flyway
- PostgreSQL
- Maven

### Frontend
- React
- TypeScript
- Vite

## CI/CD and deployment

Detailed pipeline documentation is maintained in:
- `docs/ci-cd-pipelines.md`

Current production deployment targets:
- backend: Railway
- frontend: Vercel

## Repo map (high-level)

- `backend/` - Spring Boot API and business logic
- `frontend/` - React app
- `.github/workflows/` - CI/CD workflows
- `docs/` - project and developer documentation
