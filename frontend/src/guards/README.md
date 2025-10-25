# Guards

This folder contains route guards and authentication-related components.

## Components

- **ProtectedRoute**: Wraps routes that require authentication
  - Redirects unauthenticated users to home page
  - Shows loading state while checking authentication
  - Renders children only if user is authenticated

## Usage

```typescript
import { ProtectedRoute } from '@/guards';

<ProtectedRoute>
  <ProfilePage />
</ProtectedRoute>
```
