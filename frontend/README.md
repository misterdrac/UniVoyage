# UniVoyage Frontend

Frontend application for UniVoyage - a student travel planning platform built with React and TypeScript.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root:
```
VITE_API_URL=http://localhost:8080/api(replace if not locally hosted)
```

3. Start development server:
```bash
npm run dev
```

## Project Structure

The project follows a feature-based structure where code is organized by domain and responsibility.

```
src/
├── components/          # UI components
│   ├── admin/          # Admin panel components
│   ├── auth/           # Authentication dialogs
│   ├── destinations/   # Destination-related components
│   ├── home/           # Home page components
│   ├── layout/         # Header, Footer, MainLayout
│   ├── profile/        # User profile components
│   ├── trips/          # Trip management components
│   └── ui/             # Reusable UI components (shadcn/ui)
│
├── pages/              # Page components (one per route)
│   ├── admin/         # Admin pages
│   └── destinations/  # Destination listing pages
│
├── services/           # API communication layer
│   └── api/           # API service modules
│       ├── baseClient.ts    # HTTP client base class
│       ├── authApi.ts      # Authentication endpoints
│       ├── tripsApi.ts     # Trip endpoints
│       └── ...             # Other API modules
│
├── contexts/           # React Context providers
│   ├── AuthContext.tsx     # User authentication state
│   ├── TripContext.tsx     # Trip data management
│   ├── DestinationContext.tsx  # Destination data
│   └── ThemeContext.tsx    # Dark/light theme
│
├── config/            # Configuration files
│   ├── apiConfig.ts   # API endpoints and base URL
│   └── routes.tsx     # Route definitions
│
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and helpers
├── types/             # TypeScript type definitions
└── guards/            # Route protection components
```

## Directory Overview

### `components/`
Feature-based component organization. Each feature folder contains related components and may include:
- Component files (`.tsx`)
- `hooks/` subfolder for feature-specific hooks
- `index.ts` for barrel exports

### `pages/`
One page component per route. Pages are simple wrappers that compose components.

### `services/api/`
API service layer that handles all backend communication:
- `baseClient.ts` - Base HTTP client with authentication
- Individual API modules for each domain (auth, trips, destinations, etc.)
- `api.ts` - Main service instance that combines all modules

### `contexts/`
React Context providers for global state:
- **AuthContext** - User session and authentication
- **TripContext** - Current trip and trip operations
- **DestinationContext** - Destination data and search
- **ThemeContext** - Theme preferences

### `config/`
Centralized configuration:
- `apiConfig.ts` - API endpoints and configuration
- `routes.tsx` - All application routes in one place

### `hooks/`
Reusable custom hooks shared across the application.

### `lib/`
Utility functions organized by purpose (dates, trips, destinations, etc.).

### `types/`
TypeScript type definitions for the application.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- shadcn/ui

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
