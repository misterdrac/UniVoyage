// Destination data structure and mock data
export interface Destination {
  id: number;
  imageUrl: string;
  imageAlt: string;
  title: string;
  location: string;
  continent: string;
  overview: string;
  budgetPerDay: number;
  whyVisit: string;
  studentPerks: string[];
}

export const destinations: Destination[] = [
  // Europe destinations
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1550340499-a6c60fc8287c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Paris, France",
    title: "Paris",
    location: "France",
    continent: "Europe",
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
    imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Barcelona, Spain",
    title: "Barcelona",
    location: "Spain",
    continent: "Europe",
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
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1564511287568-54483b52a35e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Prague, Czech Republic",
    title: "Prague",
    location: "Czech Republic",
    continent: "Europe",
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
    id: 4,
    imageUrl: "https://images.unsplash.com/photo-1584003564911-a7a321c84e1c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=984",
    imageAlt: "Amsterdam, Netherlands",
    title: "Amsterdam",
    location: "Netherlands",
    continent: "Europe",
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
  },
  {
    id: 5,
    imageUrl: "https://plus.unsplash.com/premium_photo-1675975706513-9daba0ec12a8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Rome, Italy",
    title: "Rome",
    location: "Italy",
    continent: "Europe",
    overview: "The Eternal City, where ancient history meets vibrant modern life. Explore the Colosseum, Vatican City, and indulge in authentic Italian cuisine.",
    budgetPerDay: 40,
    whyVisit: "Rome offers an unparalleled journey through history, art, and culture. Perfect for students fascinated by ancient civilizations, architecture, and incredible food.",
    studentPerks: [
      "Student discounts at major historical sites",
      "Affordable pizzerias and gelato shops",
      "Free entry to Vatican Museums for students",
      "Budget-friendly accommodations",
      "Discounted public transport cards"
    ]
  },
  {
    id: 6,
    imageUrl: "https://images.unsplash.com/photo-1560969184-10fe8719e047?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Berlin, Germany",
    title: "Berlin",
    location: "Germany",
    continent: "Europe",
    overview: "A city of contrasts, from historic monuments to cutting-edge art and nightlife. Experience dynamic culture and rich history in Germany's capital.",
    budgetPerDay: 35,
    whyVisit: "Berlin's vibrant art scene, affordable living, and fascinating history make it perfect for students interested in culture, history, and social experiences.",
    studentPerks: [
      "Very affordable hostels and accommodations",
      "Student discounts at museums and galleries",
      "Budget-friendly street food scene",
      "Free walking tours available",
      "Affordable public transport"
    ]
  },
  // Asia destinations
  {
    id: 7,
    imageUrl: "https://plus.unsplash.com/premium_photo-1661914240950-b0124f20a5c1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Tokyo, Japan",
    title: "Tokyo",
    location: "Japan",
    continent: "Asia",
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
    id: 14,
    imageUrl: "https://images.unsplash.com/photo-1513568720563-6a5b8c6caab3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1144",
    imageAlt: "Bangkok, Thailand",
    title: "Bangkok",
    location: "Thailand",
    continent: "Asia",
    overview: "A vibrant city where ancient temples meet modern life. Discover golden palaces, floating markets, and incredible street food for unbeatable prices.",
    budgetPerDay: 25,
    whyVisit: "Bangkok offers incredible value with its rich culture, amazing food, and affordable prices. Perfect for budget-conscious students seeking adventure.",
    studentPerks: [
      "Extremely affordable accommodations and food",
      "Very cheap public transport and tuk-tuks",
      "Budget-friendly street food everywhere",
      "Affordable temple visits and cultural sites",
      "Student-friendly nightlife and markets"
    ]
  },
  {
    id: 15,
    imageUrl: "https://images.unsplash.com/photo-1604999333679-b86d54738315?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1025",
    imageAlt: "Bali, Indonesia",
    title: "Bali",
    location: "Indonesia",
    continent: "Asia",
    overview: "Tropical paradise with stunning beaches, lush rice terraces, and spiritual culture. Experience yoga, surfing, and incredible nature on a student budget.",
    budgetPerDay: 20,
    whyVisit: "Bali offers paradise-level experiences at incredibly affordable prices. Perfect for students who love nature, culture, and adventure.",
    studentPerks: [
      "Very affordable accommodations and hostels",
      "Cheap local food and warungs",
      "Free beach access everywhere",
      "Affordable surf rentals and lessons",
      "Budget-friendly temple visits and activities"
    ]
  },
  {
    id: 16,
    imageUrl: "https://plus.unsplash.com/premium_photo-1661948404806-391a240d6d40?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1172",
    imageAlt: "Seoul, South Korea",
    title: "Seoul",
    location: "South Korea",
    continent: "Asia",
    overview: "Where ancient palaces meet K-pop culture. Experience incredible food, cutting-edge technology, and vibrant student neighborhoods.",
    budgetPerDay: 35,
    whyVisit: "Seoul perfectly combines tradition and modernity with amazing food, affordable prices, and vibrant youth culture.",
    studentPerks: [
      "Affordable student accommodations",
      "Very cheap and delicious Korean BBQ",
      "Budget-friendly public transport",
      "Free cultural experiences and temples",
      "Student discounts at major attractions"
    ]
  },
  // Africa destinations
  {
    id: 17,
    imageUrl: "https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Cape Town, South Africa",
    title: "Cape Town",
    location: "South Africa",
    continent: "Africa",
    overview: "Stunning natural beauty, vibrant culture, and incredible wildlife. From Table Mountain to penguin beaches, Cape Town offers unique experiences.",
    budgetPerDay: 30,
    whyVisit: "Cape Town provides incredible value with its stunning landscapes, diverse culture, and affordable prices. Perfect for adventurous students.",
    studentPerks: [
      "Affordable accommodations in great locations",
      "Student-friendly food and markets",
      "Budget-friendly public transport",
      "Free or cheap hiking and outdoor activities",
      "Affordable wildlife and cultural tours"
    ]
  },
  {
    id: 18,
    imageUrl: "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1524",
    imageAlt: "Marrakech, Morocco",
    title: "Marrakech",
    location: "Morocco",
    continent: "Africa",
    overview: "A sensory explosion of colors, sounds, and aromas. Explore bustling souks, stunning palaces, and nearby desert adventures.",
    budgetPerDay: 25,
    whyVisit: "Marrakech offers rich culture, incredible food, and amazing value. Perfect for students seeking exotic experiences on a budget.",
    studentPerks: [
      "Very affordable accommodations in riads",
      "Budget-friendly local cuisine and tea",
      "Affordable souk shopping and markets",
      "Student discounts at historical sites",
      "Cheap desert tours and activities"
    ]
  },
  {
    id: 19,
    imageUrl: "https://plus.unsplash.com/premium_photo-1661936361131-c421746dcd0d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2159",
    imageAlt: "Serengeti National Park, Tanzania",
    title: "Serengeti National Park",
    location: "Tanzania",
    continent: "Africa",
    overview: "Witness the Great Migration, Big Five, and endless savannas. Experience the raw beauty of African wildlife in their natural habitat.",
    budgetPerDay: 45,
    whyVisit: "Tanzania offers one of the world's greatest wildlife experiences at an unforgettable price. Perfect for students passionate about nature and wildlife.",
    studentPerks: [
      "Budget-friendly camping safaris",
      "Student group discounts for tours",
      "Affordable park entrance fees",
      "Shared accommodation options available",
      "Camping and budget lodge packages"
    ]
  },
  // Americas destinations
  {
    id: 8,
    imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "New York City, USA",
    title: "New York City",
    location: "USA",
    continent: "Americas",
    overview: "The city that never sleeps offers world-class museums, Broadway shows, and diverse neighborhoods. Experience the energy of the Big Apple.",
    budgetPerDay: 60,
    whyVisit: "NYC provides endless opportunities for students with its world-class cultural institutions, diverse food scene, and vibrant student life.",
    studentPerks: [
      "Student discounts at museums and Broadway shows",
      "Affordable Broadway ticket lotteries",
      "Budget-friendly food trucks and markets",
      "Student ID discounts at attractions",
      "Free events and concerts in parks"
    ]
  },
  {
    id: 9,
    imageUrl: "https://images.unsplash.com/flagged/photo-1575555201693-7cd442b8023f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1632",
    imageAlt: "Los Angeles, USA",
    title: "Los Angeles",
    location: "USA",
    continent: "Americas",
    overview: "Sunny beaches, Hollywood dreams, and diverse cultures. LA offers incredible food, iconic landmarks, and endless entertainment.",
    budgetPerDay: 50,
    whyVisit: "LA provides a mix of beach life, entertainment industry access, and diverse cultural experiences perfect for adventurous students.",
    studentPerks: [
      "Free days at museums and galleries",
      "Affordable student accommodations",
      "Discounted movie tickets for students",
      "Budget-friendly taco trucks and food courts",
      "Free beach access and outdoor activities"
    ]
  },
  {
    id: 10,
    imageUrl: "https://images.unsplash.com/photo-1543962226-818f4301073f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1907",
    imageAlt: "Toronto, Canada",
    title: "Toronto",
    location: "Canada",
    continent: "Americas",
    overview: "Canada's largest city offers incredible diversity, world-class museums, and a welcoming atmosphere for international students.",
    budgetPerDay: 45,
    whyVisit: "Toronto's multicultural environment, affordable cultural activities, and friendly atmosphere make it perfect for international students.",
    studentPerks: [
      "Student discounts at CN Tower and museums",
      "Affordable international cuisine",
      "Free community events and festivals",
      "Student-friendly hostels and accommodations",
      "Discounted public transit with student card"
    ]
  },
  {
    id: 11,
    imageUrl: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Rio de Janeiro, Brazil",
    title: "Rio de Janeiro",
    location: "Brazil",
    continent: "Americas",
    overview: "The Marvelous City with stunning beaches, vibrant samba culture, and iconic landmarks. Experience the energy of Carnival's hometown.",
    budgetPerDay: 35,
    whyVisit: "Rio offers an incredible mix of natural beauty, vibrant culture, and world-class beaches. Perfect for students who love music, dance, and outdoor adventures.",
    studentPerks: [
      "Affordable beachside accommodations",
      "Student discounts at major attractions",
      "Budget-friendly local food and churrasco",
      "Free or cheap beach activities and hiking",
      "Discounted public transport passes"
    ]
  },
  {
    id: 12,
    imageUrl: "https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Mexico City, Mexico",
    title: "Mexico City",
    location: "Mexico",
    continent: "Americas",
    overview: "A vibrant metropolis rich in history, art, and incredible cuisine. Explore ancient Aztec temples, world-class museums, and bustling markets.",
    budgetPerDay: 30,
    whyVisit: "Mexico City offers incredible value with its rich culture, amazing food scene, and vibrant student culture. Perfect for students on a budget.",
    studentPerks: [
      "Very affordable accommodations and food",
      "Student discounts at museums and historical sites",
      "Incredibly cheap street food and local eateries",
      "Free cultural events and festivals",
      "Budget-friendly public transport"
    ]
  },
  {
    id: 13,
    imageUrl: "https://images.unsplash.com/photo-1569700946659-fe1941c71fe4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Punta Cana, Dominican Republic",
    title: "Punta Cana",
    location: "Dominican Republic",
    continent: "Americas",
    overview: "Paradise beaches, turquoise waters, and all-inclusive resorts. Perfect for students seeking sun, sand, and tropical adventures.",
    budgetPerDay: 40,
    whyVisit: "Punta Cana offers stunning Caribbean beaches and incredible all-inclusive deals. Perfect for students who want a tropical getaway without breaking the bank.",
    studentPerks: [
      "All-inclusive student-friendly packages",
      "Affordable beach activities and watersports",
      "Free beach access and public spaces",
      "Budget-friendly local food and drinks",
      "Student discounts on tours and excursions"
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

export const getDestinationsByContinent = (continent: string): Destination[] => {
  return destinations.filter(destination => 
    destination.continent.toLowerCase() === continent.toLowerCase()
  );
};
