/**
 * Destination type definition
 * All destination data is fetched from the backend API
 */

export interface Destination {
  id: number;
  title: string;
  location: string;
  continent?: string;
  // Optional fields for full destination cards
  imageUrl?: string;
  imageAlt?: string;
  overview?: string;
  budgetPerDay?: number;
  whyVisit?: string;
  studentPerks?: string[];
  averageRating?: number; // 0–5
}

