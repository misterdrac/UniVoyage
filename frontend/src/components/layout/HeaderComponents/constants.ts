import { ROUTE_PATHS } from '@/config/routes';

export const DESTINATION_NAV_ITEMS = [
  {
    title: "Popular Destinations",
    href: ROUTE_PATHS.DESTINATIONS,
    description: "Explore the most popular destinations for students.",
  },
  {
    title: "Europe",
    href: ROUTE_PATHS.DESTINATIONS_EUROPE,
    description: "Explore historic cities and cultural landmarks across Europe.",
  },
  {
    title: "North America",
    href: ROUTE_PATHS.DESTINATIONS_NORTH_AMERICA,
    description: "Experience diverse landscapes from the USA to Canada and Mexico.",
  },
  {
    title: "South America",
    href: ROUTE_PATHS.DESTINATIONS_SOUTH_AMERICA,
    description: "Discover vibrant cultures and breathtaking landscapes across South America.",
  },
  {
    title: "Asia",
    href: ROUTE_PATHS.DESTINATIONS_ASIA,
    description: "Discover ancient traditions and modern metropolises in Asia.",
  },
  {
    title: "Africa",
    href: ROUTE_PATHS.DESTINATIONS_AFRICA,
    description: "Immerse yourself in rich cultures and stunning wildlife.",
  },
  {
    title: "Oceania",
    href: ROUTE_PATHS.DESTINATIONS_OCEANIA,
    description: "Explore stunning beaches and landscapes in sunny Oceania.",
  },
] as const;

