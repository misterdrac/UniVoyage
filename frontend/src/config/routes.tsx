import React from 'react';
import { HomePage, AboutPage, ContactPage, ProfilePage, MyTripsPage, TripDetailPage, PlanTripPage, PopularDestinationsPage, EuropeDestinationsPage, NorthAmericaDestinationsPage, SouthAmericaDestinationsPage, AsiaDestinationsPage, AfricaDestinationsPage, OceaniaDestinationsPage } from '@/pages';
import { AdminLoginPage, AdminDashboardPage, AdminUsersPage, AdminDestinationsPage } from '@/pages/admin';
import GoogleCallbackPage from '@/pages/GoogleCallbackPage';
import { MainLayout } from '@/components/layout';
import { ProtectedRoute, AdminProtectedRoute } from '@/guards';

export type RouteConfig = {
  path: string;
  element: React.ReactElement;
  layout?: boolean; // true = MainLayout, false = no layout, undefined = default (true)
  protected?: boolean | 'admin'; // true = ProtectedRoute, 'admin' = AdminProtectedRoute
};

/**
 * Helper function to wrap element with layout and protection based on config
 */
export function createRouteElement(config: RouteConfig): React.ReactElement {
  let element = config.element;

  // Apply protection
  if (config.protected === true) {
    element = <ProtectedRoute>{element}</ProtectedRoute>;
  } else if (config.protected === 'admin') {
    element = <AdminProtectedRoute>{element}</AdminProtectedRoute>;
  }

  // Apply layout (default is true unless explicitly false)
  if (config.layout !== false) {
    element = <MainLayout>{element}</MainLayout>;
  }

  return element;
}

/**
 * Centralized route configuration
 */
export const routes: RouteConfig[] = [
  // Admin Routes - No Header/Footer
  {
    path: '/admin',
    element: <AdminLoginPage />,
    layout: false,
  },
  {
    path: '/admin/dashboard',
    element: <AdminDashboardPage />,
    layout: false,
    protected: 'admin',
  },
  {
    path: '/admin/users',
    element: <AdminUsersPage />,
    layout: false,
    protected: 'admin',
  },
  {
    path: '/admin/destinations',
    element: <AdminDestinationsPage />,
    layout: false,
    protected: 'admin',
  },

  // Public Routes - With Header/Footer
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/about',
    element: <AboutPage />,
  },
  {
    path: '/contact',
    element: <ContactPage />,
  },
  {
    path: '/destinations',
    element: <PopularDestinationsPage />,
  },
  {
    path: '/destinations/europe',
    element: <EuropeDestinationsPage />,
  },
  {
    path: '/destinations/north-america',
    element: <NorthAmericaDestinationsPage />,
  },
  {
    path: '/destinations/south-america',
    element: <SouthAmericaDestinationsPage />,
  },
  {
    path: '/destinations/asia',
    element: <AsiaDestinationsPage />,
  },
  {
    path: '/destinations/africa',
    element: <AfricaDestinationsPage />,
  },
  {
    path: '/destinations/oceania',
    element: <OceaniaDestinationsPage />,
  },
  {
    path: '/auth/google/callback',
    element: <GoogleCallbackPage />,
    layout: false,
  },

  // Protected Routes - With Header/Footer
  {
    path: '/profile',
    element: <ProfilePage />,
    protected: true,
  },
  {
    path: '/plan-trip',
    element: <PlanTripPage />,
    protected: true,
  },
  {
    path: '/my-trips',
    element: <MyTripsPage />,
    protected: true,
  },
  {
    path: '/trips/:id',
    element: <TripDetailPage />,
    protected: true,
  },
];

/**
 * Helper function to get route path by matching pattern
 * Used to extract paths from routes array for ROUTE_PATHS
 */
function getRoutePath(pattern: string): string {
  const route = routes.find(r => r.path === pattern);
  if (!route) {
    throw new Error(`Route not found for pattern: ${pattern}`);
  }
  return route.path;
}

/**
 * Route path constants derived from routes array
 * These can be imported and used instead of hardcoded strings
 */
export const ROUTE_PATHS = {
  HOME: getRoutePath('/'),
  ABOUT: getRoutePath('/about'),
  CONTACT: getRoutePath('/contact'),
  DESTINATIONS: getRoutePath('/destinations'),
  DESTINATIONS_EUROPE: getRoutePath('/destinations/europe'),
  DESTINATIONS_NORTH_AMERICA: getRoutePath('/destinations/north-america'),
  DESTINATIONS_SOUTH_AMERICA: getRoutePath('/destinations/south-america'),
  DESTINATIONS_ASIA: getRoutePath('/destinations/asia'),
  DESTINATIONS_AFRICA: getRoutePath('/destinations/africa'),
  DESTINATIONS_OCEANIA: getRoutePath('/destinations/oceania'),
  PROFILE: getRoutePath('/profile'),
  PLAN_TRIP: getRoutePath('/plan-trip'),
  MY_TRIPS: getRoutePath('/my-trips'),
  TRIP_DETAIL: (id: number | string) => `/trips/${id}`,
  ADMIN: getRoutePath('/admin'),
  ADMIN_DASHBOARD: getRoutePath('/admin/dashboard'),
  ADMIN_USERS: getRoutePath('/admin/users'),
  ADMIN_DESTINATIONS: getRoutePath('/admin/destinations'),
  GOOGLE_CALLBACK: getRoutePath('/auth/google/callback'),
} as const;

