// Destination data structure and mock data
export interface Destination {
  id: number;
  imageUrl: string;
  imageAlt: string;
  title: string;
  location: string;
  overview: string;
  budgetPerDay: number;
  whyVisit: string;
  studentPerks: string[];
}

export const destinations: Destination[] = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1550340499-a6c60fc8287c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Paris, France",
    title: "Paris",
    location: "France",
    overview: "The City of Light, home to the Eiffel Tower, Louvre Museum, and world-class cuisine. Experience romance, art, and history in every corner.",
    budgetPerDay: 50,
    whyVisit: "Paris is the ultimate student destination with its rich history, world-renowned museums, and vibrant café culture. Perfect for art lovers, food enthusiasts, and anyone seeking inspiration.",
    studentPerks: [
      "Free entry to many museums with student ID",
      "Discounted metro passes for students",
      "Affordable hostels and student accommodations",
      "Student-friendly cafés and restaurants",
      "Free walking tours available daily"
    ]
  },
  {
    id: 2,
    imageUrl: "https://plus.unsplash.com/premium_photo-1661914240950-b0124f20a5c1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Tokyo, Japan",
    title: "Tokyo",
    location: "Japan",
    overview: "A mesmerizing blend of ancient traditions and cutting-edge technology. From serene temples to neon-lit streets, Tokyo offers endless adventures.",
    budgetPerDay: 40,
    whyVisit: "Tokyo provides an incredible cultural experience with its unique blend of traditional and modern Japan. Perfect for students interested in technology, culture, and amazing food.",
    studentPerks: [
      "Student discounts at major attractions",
      "Affordable capsule hotels and hostels",
      "JR Pass discounts for students",
      "Free temple visits and cultural experiences",
      "Budget-friendly ramen and street food"
    ]
  },
  {
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Barcelona, Spain",
    title: "Barcelona",
    location: "Spain",
    overview: "Architectural masterpieces by Gaudí, beautiful beaches, and vibrant nightlife. Barcelona combines art, history, and Mediterranean charm.",
    budgetPerDay: 45,
    whyVisit: "Barcelona offers the perfect mix of beach life, incredible architecture, and vibrant student culture. Great for students who love art, history, and social experiences.",
    studentPerks: [
      "Student discounts at Gaudí sites",
      "Affordable beachside accommodations",
      "Free walking tours and cultural events",
      "Student-friendly tapas bars",
      "Discounted public transport passes"
    ]
  },
  {
    id: 4,
    imageUrl: "https://images.unsplash.com/photo-1564511287568-54483b52a35e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Prague, Czech Republic",
    title: "Prague",
    location: "Czech Republic",
    overview: "The Golden City with stunning Gothic architecture, rich history, and affordable prices. A fairy-tale destination for budget-conscious travelers.",
    budgetPerDay: 30,
    whyVisit: "Prague is incredibly budget-friendly while offering stunning architecture and rich history. Perfect for students who want to experience Europe without breaking the bank.",
    studentPerks: [
      "Extremely affordable accommodations",
      "Free walking tours and historical sites",
      "Budget-friendly local cuisine",
      "Student discounts at museums and attractions",
      "Affordable public transport and beer culture"
    ]
  },
  {
    id: 5,
    imageUrl: "https://images.unsplash.com/photo-1584003564911-a7a321c84e1c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=984",
    imageAlt: "Amsterdam, Netherlands",
    title: "Amsterdam",
    location: "Netherlands",
    overview: "Canals, bicycles, world-class museums, and a unique liberal culture. Amsterdam offers a perfect blend of history, art, and modern lifestyle.",
    budgetPerDay: 55,
    whyVisit: "Amsterdam's bike-friendly culture, world-class museums, and unique atmosphere make it perfect for students interested in art, history, and sustainable living.",
    studentPerks: [
      "Student discounts at major museums",
      "Affordable bike rentals",
      "Student-friendly hostels and accommodations",
      "Free walking tours and cultural events",
      "Discounted public transport with student card"
    ]
  }
];

// Helper functions for destination data
export const getDestinationById = (id: number): Destination | undefined => {
  return destinations.find(destination => destination.id === id);
};

export const getDestinationsByLocation = (location: string): Destination[] => {
  return destinations.filter(destination => 
    destination.location.toLowerCase().includes(location.toLowerCase())
  );
};

export const getDestinationsByBudget = (maxBudget: number): Destination[] => {
  return destinations.filter(destination => destination.budgetPerDay <= maxBudget);
};
