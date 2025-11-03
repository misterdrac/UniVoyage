/**
 * ======================================================================
 * BACKEND API IMPLEMENTATION GUIDE
 * ======================================================================
 * 
 * This file needs to be replaced with API calls to backend.
 * 
 * BACKEND REQUIREMENTS:
 * 
 * 1. DATABASE TABLE (Use Flyway migration V3__create_destinations_table.sql):
 * 
 * CREATE TABLE destinations (
 *     id BIGSERIAL PRIMARY KEY,
 *     title VARCHAR(200) NOT NULL,
 *     location VARCHAR(100) NOT NULL,
 *     continent VARCHAR(50) NOT NULL,
 *     image_url TEXT,
 *     image_alt TEXT,
 *     overview TEXT,
 *     budget_per_day INTEGER,
 *     why_visit TEXT,
 *     student_perks TEXT[]
 * );
 * 
 * CREATE INDEX idx_destinations_continent ON destinations(continent);
 * CREATE INDEX idx_destinations_location ON destinations(location);
 * 
 * 2. JAVA BACKEND STRUCTURE (Mirror auth package):
 * 
 * backend/src/main/java/com/univoyage/destinations/
 *     ├── DestinationController.java       # REST endpoints
 *     ├── DestinationService.java          # Business logic  
 *     ├── DestinationEntity.java           # JPA entity
 *     ├── DestinationRepository.java       # JPA repository
 *     └── dto/
 *         └── DestinationDto.java          # Response DTO
 * 
 * 3. REST API ENDPOINTS NEEDED:
 * 
 * GET  /api/destinations                    - All destinations (paginated)
 * GET  /api/destinations?continent=Europe   - Filter by continent [implements getDestinationsByContinent()]
 * GET  /api/destinations?location=France    - Filter by country [implements getDestinationsByLocation()]
 * GET  /api/destinations?maxBudget=50       - Filter by budget [implements getDestinationsByBudget()]
 * GET  /api/destinations/popular?continent=Europe [implements getPopularDestinations()]
 * GET  /api/destinations/popular/countries?continent=Europe [implements getPopularCountries()]
 * GET  /api/destinations/{id}               - Single destination [implements getDestinationById()]
 * 
 * 4. RESPONSE FORMAT (use ApiResponse<T> wrapper):
 * 
 * {
 *   "success": true,
 *   "data": [Destination objects],
 *   "error": null
 * }
 * 
 * 5. SEED DATA: Migrate all destinations below to DB (use V4 migration)
 * 
 *    NOTE: There are TWO types of destinations below:
 *    - FULL destinations (IDs 1-30): Have all fields including imageUrl, overview, budgetPerDay, etc.
 *    - MINIMAL destinations (IDs 31-86): Only have id, title, location, continent
 *    
 *    FULL destinations = shown as cards on destination pages
 *    MINIMAL destinations = only searchable in autocomplete dropdown
 * 
 * 6. FRONTEND: Will use useQuery/React Query to fetch from these endpoints
 * 
 * ======================================================================
 */

// Destination data structure and mock data
export interface Destination {
  id: number;
  title: string;
  location: string;
  continent: string;
  // Optional fields for full destination cards
  imageUrl?: string;
  imageAlt?: string;
  overview?: string;
  budgetPerDay?: number;
  whyVisit?: string;
  studentPerks?: string[];
}

export const destinations: Destination[] = [
  // ===================================================================
  // FULL DESTINATIONS (IDs 1-30): Shown as cards on destination pages
  // ===================================================================
  // Europe - Major Cities (Lower IDs = Bigger Cities)
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
  // Croatia - Major cities first (ID 20-23)
  {
    id: 20,
    imageUrl: "https://plus.unsplash.com/premium_photo-1661963915825-9dee778ad548?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Zagreb, Croatia",
    title: "Zagreb",
    location: "Croatia",
    continent: "Europe",
    overview: "Croatia's capital blends Austro-Hungarian architecture with modern culture. Beautiful parks, museums, and a vibrant cafe scene. The perfect introduction to Croatian urban life.",
    budgetPerDay: 40,
    whyVisit: "Zagreb offers world-class museums, beautiful architecture, and vibrant student culture at great prices. Perfect for history lovers, art enthusiasts, and anyone seeking an authentic Croatian city experience.",
    studentPerks: [
      "Student discounts at museums and galleries",
      "Very affordable hostels and cafes",
      "Free walking tours available daily",
      "Budget-friendly public transport",
      "Student-friendly nightlife and restaurants"
    ]
  },
  {
    id: 21,
    imageUrl: "https://images.unsplash.com/photo-1645356753760-b61ef173c917?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Rijeka, Croatia",
    title: "Rijeka",
    location: "Croatia",
    continent: "Europe",
    overview: "Croatia's largest port city with rich maritime history, vibrant cultural scene, and stunning Kvarner Bay views. A perfect blend of urban energy and coastal charm.",
    budgetPerDay: 35,
    whyVisit: "Rijeka offers authentic Croatian culture without the tourist crowds. Perfect for students who want beautiful Adriatic views, historic architecture, and vibrant nightlife at affordable prices.",
    studentPerks: [
      "Very affordable accommodations in the city center",
      "Student-friendly restaurants and cafes",
      "Free walking tours of historic sites",
      "Budget-friendly public transport",
      "Cheap ferry connections to nearby islands"
    ]
  },
  {
    id: 22,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Petrinja_ulica.jpg",
    imageAlt: "Petrinja, Croatia",
    title: "Petrinja",
    location: "Croatia",
    continent: "Europe",
    overview: "A charming historic town in continental Croatia known for its wine region, traditional architecture, and rich cultural heritage. Experience authentic inland Croatian life.",
    budgetPerDay: 25,
    whyVisit: "Petrinja offers an authentic Croatian experience away from the coast. Perfect for students interested in history, wine culture, and exploring lesser-known destinations with budget-friendly prices.",
    studentPerks: [
      "Extremely affordable accommodations",
      "Local wine tastings at great prices",
      "Historical sites and museums",
      "Traditional Croatian cuisine at budget prices",
      "Less touristy, more authentic experience"
    ]
  },
  {
    id: 23,
    imageUrl: "https://www.yachtscroatia.hr/var/site/storage/images/_aliases/i1920/6/7/6/5/245676-14-cro-HR/1b7d205a1ed0-Otok-Silba-01.jpg.webp",
    imageAlt: "Silba, Croatia",
    title: "Silba",
    location: "Croatia",
    continent: "Europe",
    overview: "A tiny car-free island paradise in the Adriatic. Sandy beaches, crystal-clear waters, and peaceful island life. Perfect for digital nomads and solo travelers seeking tranquility.",
    budgetPerDay: 30,
    whyVisit: "Silba offers the ultimate island escape with no cars, stunning beaches, and a peaceful atmosphere. Perfect for students who want to disconnect and enjoy Croatia's natural beauty on a budget.",
    studentPerks: [
      "Very affordable private rooms and hostels",
      "Free beach access everywhere",
      "Cheap local restaurants and konoba",
      "No transport costs - walkable island",
      "Perfect for water sports and snorkeling"
    ]
  },
  // More Europe destinations
  {
    id: 24,
    imageUrl: "https://plus.unsplash.com/premium_photo-1716932567535-6bb42a3f38ff?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1632",
    imageAlt: "Vienna, Austria",
    title: "Vienna",
    location: "Austria",
    continent: "Europe",
    overview: "The City of Music with stunning palaces, world-class museums, and coffee house culture. Experience imperial grandeur and modern art on a student budget.",
    budgetPerDay: 45,
    whyVisit: "Vienna combines imperial history with vibrant modern culture. Perfect for students who love classical music, art, and beautiful architecture.",
    studentPerks: [
      "Student discounts at museums and palaces",
      "Affordable cafe culture everywhere",
      "Budget-friendly student accommodations",
      "Free classical music concerts",
      "Discounted public transport passes"
    ]
  },
  {
    id: 25,
    imageUrl: "https://images.unsplash.com/photo-1616432902940-b7a1acbc60b3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070",
    imageAlt: "Budapest, Hungary",
    title: "Budapest",
    location: "Hungary",
    continent: "Europe",
    overview: "The Pearl of the Danube with thermal baths, stunning architecture, and incredible nightlife. Experience history, culture, and affordability in this beautiful city.",
    budgetPerDay: 30,
    whyVisit: "Budapest offers incredible value with its thermal baths, stunning architecture, and vibrant student culture. Perfect for budget-conscious students who love history and nightlife.",
    studentPerks: [
      "Extremely affordable accommodations",
      "Student discounts at thermal baths",
      "Budget-friendly Hungarian cuisine",
      "Free walking tours and historical sites",
      "Affordable public transport"
    ]
  },
  {
    id: 26,
    imageUrl: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?ixlib=rb-4.1.https://images.unsplash.com/photo-1588653818221-2651ec1a6423?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1171",
    imageAlt: "Stockholm, Sweden",
    title: "Stockholm",
    location: "Sweden",
    continent: "Europe",
    overview: "A beautiful archipelago city with stunning design, museums, and vibrant culture. Experience Swedish lifestyle and modern Scandinavian architecture.",
    budgetPerDay: 50,
    whyVisit: "Stockholm offers world-class design, beautiful scenery, and a unique Scandinavian experience. Perfect for students interested in sustainability, design, and nature.",
    studentPerks: [
      "Student discounts at museums and attractions",
      "Affordable student accommodations",
      "Free walking tours and cultural events",
      "Budget-friendly Swedish food",
      "Discounted public transport passes"
    ]
  },
  // More Asia destinations
  {
    id: 27,
    imageUrl: "https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Shanghai, China",
    title: "Shanghai",
    location: "China",
    continent: "Asia",
    overview: "A futuristic metropolis where ancient meets ultra-modern. Experience stunning skylines, incredible food, and vibrant youth culture.",
    budgetPerDay: 35,
    whyVisit: "Shanghai offers an incredible mix of old and new China with amazing food, stunning architecture, and affordable prices for students.",
    studentPerks: [
      "Affordable street food everywhere",
      "Student discounts at attractions",
      "Budget-friendly public transport",
      "Free cultural experiences and parks",
      "Cheap accommodation options"
    ]
  },
  {
    id: 28,
    imageUrl: "https://images.unsplash.com/photo-1605425183435-25b7e99104a4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=764",
    imageAlt: "Singapore",
    title: "Singapore",
    location: "Singapore",
    continent: "Asia",
    overview: "A clean, modern city-state with amazing food, stunning architecture, and perfect public transport. Experience diverse cultures and world-class attractions.",
    budgetPerDay: 45,
    whyVisit: "Singapore offers incredible food, stunning architecture, and a unique blend of cultures. Perfect for students who love modern cities with traditional charm.",
    studentPerks: [
      "Student discounts at major attractions",
      "Affordable hawker centers everywhere",
      "Excellent and cheap public transport",
      "Free parks and outdoor activities",
      "Student-friendly hostels and accommodations"
    ]
  },
  // More Americas destinations
  {
    id: 29,
    imageUrl: "https://images.unsplash.com/photo-1543059080-f9b1272213d5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074",
    imageAlt: "São Paulo, Brazil",
    title: "São Paulo",
    location: "Brazil",
    continent: "Americas",
    overview: "South America's largest city offers incredible diversity, world-class food, and vibrant nightlife. Experience authentic Brazilian culture at great prices.",
    budgetPerDay: 30,
    whyVisit: "São Paulo offers amazing food, vibrant culture, and incredible value. Perfect for students who love music, food, and authentic experiences.",
    studentPerks: [
      "Extremely affordable accommodations",
      "Incredibly cheap and delicious food",
      "Free street festivals and events",
      "Budget-friendly public transport",
      "Student discounts at museums and attractions"
    ]
  },
  {
    id: 30,
    imageUrl: "https://plus.unsplash.com/premium_photo-1697729901052-fe8900e24993?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1633",
    imageAlt: "Buenos Aires, Argentina",
    title: "Buenos Aires",
    location: "Argentina",
    continent: "Americas",
    overview: "The Paris of South America with stunning architecture, incredible tango culture, and amazing food. Experience vibrant street life and rich culture.",
    budgetPerDay: 35,
    whyVisit: "Buenos Aires offers incredible value with its European charm, amazing food, and vibrant student culture. Perfect for students who love culture and nightlife.",
    studentPerks: [
      "Very affordable accommodations and food",
      "Student discounts at cultural attractions",
      "Free tango shows and street performances",
      "Budget-friendly parrillas and cafes",
      "Cheap public transport"
    ]
  },
  // More Europe destinations
  {
    id: 87,
    imageUrl: "https://images.unsplash.com/photo-1500380804539-4e1e8c1e7118?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "London, United Kingdom",
    title: "London",
    location: "United Kingdom",
    continent: "Europe",
    overview: "The historic capital with world-class museums, royal palaces, and diverse culture. Experience centuries of history, cutting-edge art, and vibrant student life.",
    budgetPerDay: 55,
    whyVisit: "London offers unparalleled cultural experiences, world-class universities, and vibrant student neighborhoods. Perfect for students who love history, art, and multicultural experiences.",
    studentPerks: [
      "Free entry to many world-class museums",
      "Student discounts at attractions and theaters",
      "Affordable student accommodations in great neighborhoods",
      "Student Oyster card discounts for public transport",
      "Budget-friendly markets and food halls"
    ]
  },
  {
    id: 88,
    imageUrl: "https://images.unsplash.com/photo-1634499282463-274002e296a9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1632",
    imageAlt: "Dublin, Ireland",
    title: "Dublin",
    location: "Ireland",
    continent: "Europe",
    overview: "The friendly capital known for its literary heritage, lively pubs, and welcoming atmosphere. Experience rich history, music, and vibrant student culture.",
    budgetPerDay: 45,
    whyVisit: "Dublin offers a warm welcome, rich literary culture, and vibrant student life. Perfect for students who love literature, music, and friendly local culture.",
    studentPerks: [
      "Student discounts at historical sites and museums",
      "Affordable student accommodations",
      "Budget-friendly pub culture and food",
      "Free walking tours and cultural events",
      "Student discounts on public transport"
    ]
  },
  {
    id: 89,
    imageUrl: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1173",
    imageAlt: "Lisbon, Portugal",
    title: "Lisbon",
    location: "Portugal",
    continent: "Europe",
    overview: "A stunning coastal capital with colorful tiles, historic trams, and incredible food. Experience beautiful architecture, vibrant neighborhoods, and affordable prices.",
    budgetPerDay: 35,
    whyVisit: "Lisbon offers incredible value with its stunning beauty, amazing food, and vibrant culture. Perfect for students who love coastal cities, history, and affordable European experiences.",
    studentPerks: [
      "Very affordable accommodations and food",
      "Student discounts at attractions and museums",
      "Budget-friendly public transport",
      "Free walking tours and cultural events",
      "Affordable seafood and local cuisine"
    ]
  },
  {
    id: 90,
    imageUrl: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Copenhagen, Denmark",
    title: "Copenhagen",
    location: "Denmark",
    continent: "Europe",
    overview: "The world's happiest city with stunning design, bike-friendly streets, and incredible food scene. Experience Scandinavian lifestyle and modern sustainability.",
    budgetPerDay: 50,
    whyVisit: "Copenhagen offers world-class design, sustainable living, and incredible food culture. Perfect for students interested in sustainability, design, and Scandinavian lifestyle.",
    studentPerks: [
      "Student discounts at museums and attractions",
      "Affordable bike rentals and public transport",
      "Budget-friendly student accommodations",
      "Free cultural events and festivals",
      "Student-friendly food markets and cafes"
    ]
  },
  {
    id: 91,
    imageUrl: "https://plus.unsplash.com/premium_photo-1733259769233-72fe12c32433?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074",
    imageAlt: "Oslo, Norway",
    title: "Oslo",
    location: "Norway",
    continent: "Europe",
    overview: "A beautiful capital surrounded by fjords and forests. Experience stunning natural beauty, world-class museums, and modern Scandinavian architecture.",
    budgetPerDay: 55,
    whyVisit: "Oslo offers incredible natural beauty, world-class museums, and a unique Scandinavian experience. Perfect for students who love nature, art, and outdoor activities.",
    studentPerks: [
      "Student discounts at museums and attractions",
      "Affordable student accommodations",
      "Free access to many outdoor activities",
      "Discounted public transport passes",
      "Student-friendly food markets"
    ]
  },
  {
    id: 92,
    imageUrl: "https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Helsinki, Finland",
    title: "Helsinki",
    location: "Finland",
    continent: "Europe",
    overview: "A modern design capital with stunning architecture, sauna culture, and beautiful archipelago. Experience Finnish lifestyle and cutting-edge design.",
    budgetPerDay: 50,
    whyVisit: "Helsinki offers world-class design, unique sauna culture, and beautiful nature. Perfect for students interested in design, technology, and Nordic experiences.",
    studentPerks: [
      "Student discounts at museums and attractions",
      "Affordable student accommodations",
      "Budget-friendly public transport",
      "Free cultural events and festivals",
      "Student-friendly cafes and markets"
    ]
  },
  {
    id: 93,
    imageUrl: "https://images.unsplash.com/photo-1606130503037-6a8ef67c9d2d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1625",
    imageAlt: "Reykjavik, Iceland",
    title: "Reykjavik",
    location: "Iceland",
    continent: "Europe",
    overview: "A small capital with incredible natural wonders nearby. Experience geysers, waterfalls, Northern Lights, and unique Icelandic culture.",
    budgetPerDay: 60,
    whyVisit: "Iceland offers once-in-a-lifetime natural experiences with geysers, waterfalls, and Northern Lights. Perfect for adventurous students who love nature and unique cultures.",
    studentPerks: [
      "Student discounts at attractions and tours",
      "Affordable student accommodations",
      "Budget-friendly grocery stores",
      "Student discounts on tours and activities",
      "Free natural attractions and hiking"
    ]
  },
  {
    id: 94,
    imageUrl: "https://images.unsplash.com/photo-1607078486875-a697a8a38e87?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Warsaw, Poland",
    title: "Warsaw",
    location: "Poland",
    continent: "Europe",
    overview: "A resilient capital that rebuilt from ruins. Experience rich history, vibrant culture, and incredible value. Perfect blend of old and new Europe.",
    budgetPerDay: 30,
    whyVisit: "Warsaw offers incredible value with its rich history, vibrant culture, and affordable prices. Perfect for budget-conscious students who love history and culture.",
    studentPerks: [
      "Extremely affordable accommodations and food",
      "Student discounts at museums and attractions",
      "Budget-friendly public transport",
      "Free walking tours and cultural events",
      "Very cheap local cuisine and cafes"
    ]
  },
  {
    id: 95,
    imageUrl: "https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Athens, Greece",
    title: "Athens",
    location: "Greece",
    continent: "Europe",
    overview: "The ancient capital where history comes alive. Explore ancient ruins, world-class museums, and vibrant neighborhoods with incredible food.",
    budgetPerDay: 35,
    whyVisit: "Athens offers incredible history, amazing food, and great value. Perfect for students fascinated by ancient civilizations, mythology, and Mediterranean culture.",
    studentPerks: [
      "Student discounts at archaeological sites",
      "Very affordable accommodations and food",
      "Free entry to many museums with student ID",
      "Budget-friendly public transport",
      "Cheap and delicious Greek cuisine"
    ]
  },
  {
    id: 96,
    imageUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Istanbul, Turkey",
    title: "Istanbul",
    location: "Turkey",
    continent: "Europe",
    overview: "A city spanning two continents with incredible history, stunning architecture, and amazing food. Experience the bridge between Europe and Asia.",
    budgetPerDay: 30,
    whyVisit: "Istanbul offers incredible value with its rich history, stunning architecture, and amazing food. Perfect for students who love culture, history, and unique experiences.",
    studentPerks: [
      "Very affordable accommodations and food",
      "Student discounts at historical sites",
      "Budget-friendly public transport",
      "Free walking tours and cultural events",
      "Incredibly cheap and delicious Turkish cuisine"
    ]
  },
  {
    id: 97,
    imageUrl: "https://images.unsplash.com/photo-1701013694884-a278c7acea5c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1077",
    imageAlt: "Brussels, Belgium",
    title: "Brussels",
    location: "Belgium",
    continent: "Europe",
    overview: "The European capital with stunning architecture, world-class beer, and incredible chocolate. Experience rich culture and vibrant international atmosphere.",
    budgetPerDay: 45,
    whyVisit: "Brussels offers incredible food culture, beautiful architecture, and vibrant international atmosphere. Perfect for students interested in European politics, culture, and cuisine.",
    studentPerks: [
      "Student discounts at museums and attractions",
      "Affordable student accommodations",
      "Budget-friendly public transport",
      "Free cultural events and festivals",
      "Student-friendly food markets and cafes"
    ]
  },
  {
    id: 98,
    imageUrl: "https://images.unsplash.com/photo-1620563092215-0fbc6b55cfc5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1171",
    imageAlt: "Zurich, Switzerland",
    title: "Zurich",
    location: "Switzerland",
    continent: "Europe",
    overview: "A stunning lakeside city with incredible natural beauty, world-class museums, and pristine cleanliness. Experience Swiss precision and Alpine beauty.",
    budgetPerDay: 60,
    whyVisit: "Zurich offers stunning natural beauty, world-class cultural institutions, and a unique Swiss experience. Perfect for students who love nature, culture, and quality.",
    studentPerks: [
      "Student discounts at museums and attractions",
      "Affordable student accommodations",
      "Discounted public transport passes",
      "Free cultural events and festivals",
      "Student-friendly food options"
    ]
  },
  {
    id: 99,
    imageUrl: "https://images.unsplash.com/photo-1564336899707-dd34a4b165d7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1143",
    imageAlt: "Bucharest, Romania",
    title: "Bucharest",
    location: "Romania",
    continent: "Europe",
    overview: "The Paris of the East with stunning architecture, vibrant nightlife, and incredible value. Experience a mix of Eastern European charm and modern culture.",
    budgetPerDay: 25,
    whyVisit: "Bucharest offers incredible value with its beautiful architecture, vibrant culture, and extremely affordable prices. Perfect for budget-conscious students who love culture and nightlife.",
    studentPerks: [
      "Extremely affordable accommodations and food",
      "Student discounts at attractions",
      "Budget-friendly public transport",
      "Free cultural events and festivals",
      "Very cheap local cuisine and cafes"
    ]
  },
  // More Asia destinations
  {
    id: 100,
    imageUrl: "https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Delhi, India",
    title: "Delhi",
    location: "India",
    continent: "Asia",
    overview: "A vibrant capital where ancient history meets modern life. Experience incredible food, stunning monuments, and rich culture at unbeatable prices.",
    budgetPerDay: 20,
    whyVisit: "Delhi offers incredible value with its rich history, amazing food, and vibrant culture. Perfect for students who love history, food, and authentic cultural experiences.",
    studentPerks: [
      "Extremely affordable accommodations and food",
      "Student discounts at historical sites",
      "Budget-friendly public transport",
      "Free cultural events and festivals",
      "Incredibly cheap and delicious street food"
    ]
  },
  {
    id: 101,
    imageUrl: "https://images.unsplash.com/photo-1521019795854-14e15f600980?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1632",
    imageAlt: "Ho Chi Minh City, Vietnam",
    title: "Ho Chi Minh City",
    location: "Vietnam",
    continent: "Asia",
    overview: "A vibrant metropolis with rich history, incredible street food, and bustling energy. Experience authentic Vietnamese culture and amazing value.",
    budgetPerDay: 20,
    whyVisit: "Ho Chi Minh City offers incredible value with amazing food, rich history, and vibrant culture. Perfect for budget-conscious students who love food and authentic experiences.",
    studentPerks: [
      "Extremely affordable accommodations and food",
      "Student discounts at attractions",
      "Budget-friendly public transport and motorbikes",
      "Free cultural events and festivals",
      "Incredibly cheap and delicious Vietnamese cuisine"
    ]
  },
  {
    id: 102,
    imageUrl: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Kuala Lumpur, Malaysia",
    title: "Kuala Lumpur",
    location: "Malaysia",
    continent: "Asia",
    overview: "A modern metropolis with stunning skyscrapers, incredible food, and diverse culture. Experience the perfect blend of traditional and modern Asia.",
    budgetPerDay: 25,
    whyVisit: "Kuala Lumpur offers incredible value with amazing food, modern attractions, and diverse culture. Perfect for students who love modern cities with traditional charm.",
    studentPerks: [
      "Very affordable accommodations and food",
      "Student discounts at attractions",
      "Budget-friendly public transport",
      "Free cultural events and festivals",
      "Cheap and delicious Malaysian cuisine"
    ]
  },
  {
    id: 103,
    imageUrl: "https://images.unsplash.com/photo-1655016268120-383558788b37?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1171",
    imageAlt: "Manila, Philippines",
    title: "Manila",
    location: "Philippines",
    continent: "Asia",
    overview: "A vibrant capital with rich history, incredible food, and friendly locals. Experience authentic Filipino culture and amazing value.",
    budgetPerDay: 20,
    whyVisit: "Manila offers incredible value with amazing food, rich culture, and friendly atmosphere. Perfect for students who love authentic experiences and tropical vibes.",
    studentPerks: [
      "Extremely affordable accommodations and food",
      "Student discounts at attractions",
      "Budget-friendly public transport",
      "Free cultural events and festivals",
      "Very cheap and delicious Filipino cuisine"
    ]
  },
  {
    id: 104,
    imageUrl: "https://plus.unsplash.com/premium_photo-1661955975506-04d3812be312?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1171",
    imageAlt: "Taipei, Taiwan",
    title: "Taipei",
    location: "Taiwan",
    continent: "Asia",
    overview: "A modern city with incredible food, stunning temples, and vibrant night markets. Experience the perfect blend of traditional and modern Taiwan.",
    budgetPerDay: 30,
    whyVisit: "Taipei offers incredible food, rich culture, and modern amenities at great prices. Perfect for students who love food, technology, and authentic Asian experiences.",
    studentPerks: [
      "Affordable accommodations and food",
      "Student discounts at attractions",
      "Budget-friendly public transport",
      "Free cultural events and festivals",
      "Cheap and delicious night market food"
    ]
  },
  {
    id: 105,
    imageUrl: "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1528",
    imageAlt: "Hong Kong",
    title: "Hong Kong",
    location: "Hong Kong",
    continent: "Asia",
    overview: "A dynamic city where East meets West. Experience stunning skylines, incredible food, and vibrant culture in this world-class metropolis.",
    budgetPerDay: 40,
    whyVisit: "Hong Kong offers incredible food, stunning views, and unique blend of cultures. Perfect for students who love modern cities, food, and vibrant energy.",
    studentPerks: [
      "Student discounts at attractions",
      "Affordable student accommodations",
      "Budget-friendly public transport",
      "Free cultural events and festivals",
      "Affordable food options in local markets"
    ]
  },
  {
    id: 106,
    imageUrl: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1933",
    imageAlt: "Kathmandu, Nepal",
    title: "Kathmandu",
    location: "Nepal",
    continent: "Asia",
    overview: "A spiritual capital surrounded by stunning mountains. Experience ancient temples, rich culture, and incredible natural beauty at amazing prices.",
    budgetPerDay: 15,
    whyVisit: "Kathmandu offers incredible value with its rich culture, spiritual atmosphere, and stunning natural beauty. Perfect for adventurous students who love mountains and culture.",
    studentPerks: [
      "Extremely affordable accommodations and food",
      "Student discounts at temples and attractions",
      "Budget-friendly local transport",
      "Free cultural events and festivals",
      "Very cheap and delicious local cuisine"
    ]
  },
  {
    id: 107,
    imageUrl: "https://images.unsplash.com/photo-1653478673261-4937126eb512?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Colombo, Sri Lanka",
    title: "Colombo",
    location: "Sri Lanka",
    continent: "Asia",
    overview: "A coastal capital with colonial architecture, incredible food, and beautiful beaches nearby. Experience authentic Sri Lankan culture and amazing value.",
    budgetPerDay: 20,
    whyVisit: "Colombo offers incredible value with amazing food, beautiful beaches, and rich culture. Perfect for students who love coastal cities, culture, and authentic experiences.",
    studentPerks: [
      "Very affordable accommodations and food",
      "Student discounts at attractions",
      "Budget-friendly public transport",
      "Free cultural events and festivals",
      "Cheap and delicious Sri Lankan cuisine"
    ]
  },
  // More Americas destinations
  {
    id: 108,
    imageUrl: "https://images.unsplash.com/photo-1559511260-66a654ae982a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1518",
    imageAlt: "Vancouver, Canada",
    title: "Vancouver",
    location: "Canada",
    continent: "Americas",
    overview: "A stunning coastal city surrounded by mountains and ocean. Experience incredible natural beauty, diverse culture, and world-class quality of life.",
    budgetPerDay: 50,
    whyVisit: "Vancouver offers stunning natural beauty, diverse culture, and excellent quality of life. Perfect for students who love nature, outdoor activities, and multicultural experiences.",
    studentPerks: [
      "Student discounts at attractions",
      "Affordable student accommodations",
      "Budget-friendly public transport",
      "Free outdoor activities and parks",
      "Student-friendly food options"
    ]
  },
  {
    id: 109,
    imageUrl: "https://images.unsplash.com/photo-1613060600794-b4d20def8e02?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1194",
    imageAlt: "Montreal, Canada",
    title: "Montreal",
    location: "Canada",
    continent: "Americas",
    overview: "A vibrant French-Canadian city with incredible food, rich culture, and beautiful architecture. Experience European charm in North America.",
    budgetPerDay: 40,
    whyVisit: "Montreal offers incredible food, rich culture, and European charm. Perfect for students who love culture, festivals, and vibrant city life.",
    studentPerks: [
      "Student discounts at attractions",
      "Affordable student accommodations",
      "Budget-friendly public transport",
      "Free festivals and cultural events",
      "Student-friendly food markets and cafes"
    ]
  },
  {
    id: 110,
    imageUrl: "https://images.unsplash.com/photo-1528072164453-f4e8ef0d475a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1171",
    imageAlt: "Sydney, Australia",
    title: "Sydney",
    location: "Australia",
    continent: "Asia",
    overview: "A stunning harbor city with iconic landmarks, beautiful beaches, and incredible quality of life. Experience outdoor lifestyle and vibrant culture.",
    budgetPerDay: 55,
    whyVisit: "Sydney offers stunning natural beauty, world-class beaches, and excellent quality of life. Perfect for students who love outdoor activities, beaches, and vibrant city life.",
    studentPerks: [
      "Student discounts at attractions",
      "Affordable student accommodations",
      "Budget-friendly public transport",
      "Free beach access and outdoor activities",
      "Student-friendly food markets"
    ]
  },
  {
    id: 111,
    imageUrl: "https://plus.unsplash.com/premium_photo-1733317293766-5606f74b765b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074",
    imageAlt: "Melbourne, Australia",
    title: "Melbourne",
    location: "Australia",
    continent: "Asia",
    overview: "A cultural capital known for incredible food, street art, and vibrant arts scene. Experience coffee culture, festivals, and world-class quality of life.",
    budgetPerDay: 50,
    whyVisit: "Melbourne offers incredible food, vibrant arts scene, and excellent quality of life. Perfect for students who love culture, food, and creative experiences.",
    studentPerks: [
      "Student discounts at attractions",
      "Affordable student accommodations",
      "Budget-friendly public transport",
      "Free cultural events and festivals",
      "Student-friendly food markets and cafes"
    ]
  },
  {
    id: 112,
    imageUrl: "https://images.unsplash.com/photo-1515248027005-c33283ec3fba?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1168",
    imageAlt: "Auckland, New Zealand",
    title: "Auckland",
    location: "New Zealand",
    continent: "Asia",
    overview: "A stunning harbor city surrounded by volcanoes and islands. Experience incredible natural beauty, outdoor activities, and friendly Kiwi culture.",
    budgetPerDay: 50,
    whyVisit: "Auckland offers stunning natural beauty, outdoor activities, and excellent quality of life. Perfect for students who love nature, adventure, and friendly local culture.",
    studentPerks: [
      "Student discounts at attractions",
      "Affordable student accommodations",
      "Budget-friendly public transport",
      "Free outdoor activities and parks",
      "Student-friendly food options"
    ]
  },
  {
    id: 113,
    imageUrl: "https://images.unsplash.com/photo-1647618920221-43306af5c58d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074",
    imageAlt: "Santiago, Chile",
    title: "Santiago",
    location: "Chile",
    continent: "Americas",
    overview: "A modern capital with stunning mountain views, incredible wine, and vibrant culture. Experience the gateway to Chilean adventures.",
    budgetPerDay: 35,
    whyVisit: "Santiago offers incredible value with amazing wine, stunning mountain views, and vibrant culture. Perfect for students who love nature, wine, and South American experiences.",
    studentPerks: [
      "Very affordable accommodations and food",
      "Student discounts at attractions",
      "Budget-friendly public transport",
      "Free cultural events and festivals",
      "Affordable Chilean cuisine and wine"
    ]
  },
  {
    id: 114,
    imageUrl: "https://images.unsplash.com/photo-1512617835784-a92626c0a554?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074",
    imageAlt: "Bogota, Colombia",
    title: "Bogota",
    location: "Colombia",
    continent: "Americas",
    overview: "A vibrant capital at high altitude with incredible food, rich culture, and friendly locals. Experience authentic Colombian culture and amazing value.",
    budgetPerDay: 25,
    whyVisit: "Bogota offers incredible value with amazing food, rich culture, and friendly atmosphere. Perfect for students who love culture, food, and authentic South American experiences.",
    studentPerks: [
      "Extremely affordable accommodations and food",
      "Student discounts at attractions",
      "Budget-friendly public transport",
      "Free cultural events and festivals",
      "Very cheap and delicious Colombian cuisine"
    ]
  },
  {
    id: 115,
    imageUrl: "https://images.unsplash.com/photo-1580530719837-952e0515b69a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Lima, Peru",
    title: "Lima",
    location: "Peru",
    continent: "Americas",
    overview: "A coastal capital known for world-class cuisine, rich history, and vibrant culture. Experience the gateway to Machu Picchu and incredible food.",
    budgetPerDay: 30,
    whyVisit: "Lima offers incredible food, rich history, and amazing value. Perfect for students who love cuisine, history, and authentic South American experiences.",
    studentPerks: [
      "Very affordable accommodations and food",
      "Student discounts at attractions",
      "Budget-friendly public transport",
      "Free cultural events and festivals",
      "Affordable world-class Peruvian cuisine"
    ]
  },
  {
    id: 116,
    imageUrl: "https://images.unsplash.com/photo-1500759285222-a95626b934cb?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Havana, Cuba",
    title: "Havana",
    location: "Cuba",
    continent: "Americas",
    overview: "A time-capsule capital with colorful colonial architecture, vintage cars, and incredible music. Experience authentic Cuban culture and unique atmosphere.",
    budgetPerDay: 30,
    whyVisit: "Havana offers a unique cultural experience with its preserved architecture, vibrant music scene, and authentic atmosphere. Perfect for students who love history, music, and unique experiences.",
    studentPerks: [
      "Very affordable accommodations and food",
      "Student discounts at attractions",
      "Budget-friendly local transport",
      "Free cultural events and music",
      "Affordable Cuban cuisine"
    ]
  },
  {
    id: 117,
    imageUrl: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Cairo, Egypt",
    title: "Cairo",
    location: "Egypt",
    continent: "Africa",
    overview: "An ancient capital with incredible pyramids, rich history, and vibrant culture. Experience thousands of years of history and amazing value.",
    budgetPerDay: 25,
    whyVisit: "Cairo offers incredible history, amazing value, and unique cultural experiences. Perfect for students fascinated by ancient civilizations, history, and Middle Eastern culture.",
    studentPerks: [
      "Very affordable accommodations and food",
      "Student discounts at historical sites",
      "Budget-friendly public transport",
      "Free cultural events and festivals",
      "Cheap and delicious Egyptian cuisine"
    ]
  },
  {
    id: 118,
    imageUrl: "https://images.unsplash.com/photo-1635595358293-03620e36be48?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    imageAlt: "Nairobi, Kenya",
    title: "Nairobi",
    location: "Kenya",
    continent: "Africa",
    overview: "A vibrant capital with incredible wildlife nearby, rich culture, and friendly locals. Experience the gateway to African safaris and amazing adventures.",
    budgetPerDay: 30,
    whyVisit: "Nairobi offers incredible wildlife experiences, rich culture, and amazing value. Perfect for adventurous students who love wildlife, nature, and authentic African experiences.",
    studentPerks: [
      "Very affordable accommodations and food",
      "Student discounts at attractions",
      "Budget-friendly public transport",
      "Free cultural events and festivals",
      "Affordable local cuisine"
    ]
  },
  {
    id: 119,
    imageUrl: "https://images.unsplash.com/photo-1630386226447-af0a955c1009?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1124",
    imageAlt: "Accra, Ghana",
    title: "Accra",
    location: "Ghana",
    continent: "Africa",
    overview: "A vibrant coastal capital with rich history, incredible music, and friendly locals. Experience authentic West African culture and amazing value.",
    budgetPerDay: 25,
    whyVisit: "Accra offers incredible culture, friendly atmosphere, and amazing value. Perfect for students who love music, history, and authentic West African experiences.",
    studentPerks: [
      "Very affordable accommodations and food",
      "Student discounts at attractions",
      "Budget-friendly public transport",
      "Free cultural events and music",
      "Cheap and delicious Ghanaian cuisine"
    ]
  },
  // ===================================================================
  // MINIMAL DESTINATIONS (IDs 31-86): Only searchable in autocomplete
  // ===================================================================
  // Europe
  { id: 31, title: "Lyon", location: "France", continent: "Europe" },
  { id: 32, title: "Nice", location: "France", continent: "Europe" },
  { id: 33, title: "Madrid", location: "Spain", continent: "Europe" },
  { id: 34, title: "Porto", location: "Portugal", continent: "Europe" },
  { id: 35, title: "Cork", location: "Ireland", continent: "Europe" },
  { id: 36, title: "Salzburg", location: "Austria", continent: "Europe" },
  { id: 37, title: "Aarhus", location: "Denmark", continent: "Europe" },
  { id: 38, title: "Gothenburg", location: "Sweden", continent: "Europe" },
  { id: 39, title: "Bergen", location: "Norway", continent: "Europe" },
  { id: 40, title: "Tampere", location: "Finland", continent: "Europe" },
  { id: 41, title: "Krakow", location: "Poland", continent: "Europe" },
  { id: 42, title: "Debrecen", location: "Hungary", continent: "Europe" },
  { id: 43, title: "Thessaloniki", location: "Greece", continent: "Europe" },
  { id: 44, title: "Split", location: "Croatia", continent: "Europe" },
  { id: 45, title: "Dubrovnik", location: "Croatia", continent: "Europe" },
  { id: 46, title: "Florence", location: "Italy", continent: "Europe" },
  { id: 47, title: "Venice", location: "Italy", continent: "Europe" },
  { id: 48, title: "Milan", location: "Italy", continent: "Europe" },
  { id: 49, title: "Birmingham", location: "United Kingdom", continent: "Europe" },
  { id: 50, title: "Liverpool", location: "United Kingdom", continent: "Europe" },
  { id: 135, title: "Edinburgh", location: "United Kingdom", continent: "Europe" },
  { id: 136, title: "Manchester", location: "United Kingdom", continent: "Europe" },
  { id: 137, title: "Bristol", location: "United Kingdom", continent: "Europe" },
  { id: 138, title: "Glasgow", location: "United Kingdom", continent: "Europe" },
  { id: 139, title: "Munich", location: "Germany", continent: "Europe" },
  { id: 140, title: "Hamburg", location: "Germany", continent: "Europe" },
  { id: 141, title: "Frankfurt", location: "Germany", continent: "Europe" },
  { id: 142, title: "Cologne", location: "Germany", continent: "Europe" },
  { id: 143, title: "Seville", location: "Spain", continent: "Europe" },
  { id: 144, title: "Valencia", location: "Spain", continent: "Europe" },
  { id: 145, title: "Granada", location: "Spain", continent: "Europe" },
  { id: 146, title: "Marseille", location: "France", continent: "Europe" },
  { id: 147, title: "Toulouse", location: "France", continent: "Europe" },
  { id: 148, title: "Strasbourg", location: "France", continent: "Europe" },
  { id: 149, title: "Naples", location: "Italy", continent: "Europe" },
  { id: 150, title: "Bologna", location: "Italy", continent: "Europe" },
  { id: 151, title: "Turin", location: "Italy", continent: "Europe" },
  { id: 152, title: "Ghent", location: "Belgium", continent: "Europe" },
  { id: 153, title: "Bruges", location: "Belgium", continent: "Europe" },
  { id: 154, title: "Geneva", location: "Switzerland", continent: "Europe" },
  { id: 155, title: "Basel", location: "Switzerland", continent: "Europe" },
  { id: 156, title: "Lucerne", location: "Switzerland", continent: "Europe" },
  { id: 157, title: "Coimbra", location: "Portugal", continent: "Europe" },
  { id: 158, title: "Faro", location: "Portugal", continent: "Europe" },
  { id: 159, title: "Galway", location: "Ireland", continent: "Europe" },
  { id: 160, title: "Limerick", location: "Ireland", continent: "Europe" },
  { id: 161, title: "Odense", location: "Denmark", continent: "Europe" },
  { id: 162, title: "Aalborg", location: "Denmark", continent: "Europe" },
  { id: 163, title: "Trondheim", location: "Norway", continent: "Europe" },
  { id: 164, title: "Stavanger", location: "Norway", continent: "Europe" },
  { id: 165, title: "Oulu", location: "Finland", continent: "Europe" },
  { id: 166, title: "Rovaniemi", location: "Finland", continent: "Europe" },
  { id: 167, title: "Gdansk", location: "Poland", continent: "Europe" },
  { id: 168, title: "Wroclaw", location: "Poland", continent: "Europe" },
  { id: 169, title: "Poznan", location: "Poland", continent: "Europe" },
  { id: 170, title: "Mykonos", location: "Greece", continent: "Europe" },
  { id: 171, title: "Santorini", location: "Greece", continent: "Europe" },
  { id: 172, title: "Rhodes", location: "Greece", continent: "Europe" },
  { id: 173, title: "Ankara", location: "Turkey", continent: "Europe" },
  { id: 174, title: "Izmir", location: "Turkey", continent: "Europe" },
  { id: 175, title: "Antalya", location: "Turkey", continent: "Europe" },
  { id: 176, title: "Cluj-Napoca", location: "Romania", continent: "Europe" },
  { id: 177, title: "Timisoara", location: "Romania", continent: "Europe" },
  { id: 178, title: "Brno", location: "Czech Republic", continent: "Europe" },
  { id: 179, title: "Ostrava", location: "Czech Republic", continent: "Europe" },
  { id: 180, title: "Rotterdam", location: "Netherlands", continent: "Europe" },
  { id: 181, title: "Utrecht", location: "Netherlands", continent: "Europe" },
  { id: 182, title: "The Hague", location: "Netherlands", continent: "Europe" },
  // Asia
  { id: 51, title: "Chiang Mai", location: "Thailand", continent: "Asia" },
  { id: 52, title: "Da Nang", location: "Vietnam", continent: "Asia" },
  { id: 53, title: "Hanoi", location: "Vietnam", continent: "Asia" },
  { id: 54, title: "Penang", location: "Malaysia", continent: "Asia" },
  { id: 55, title: "Jakarta", location: "Indonesia", continent: "Asia" },
  { id: 56, title: "Cebu", location: "Philippines", continent: "Asia" },
  { id: 57, title: "Pokhara", location: "Nepal", continent: "Asia" },
  { id: 58, title: "Kandy", location: "Sri Lanka", continent: "Asia" },
  { id: 59, title: "Tashkent", location: "Uzbekistan", continent: "Asia" },
  { id: 60, title: "Almaty", location: "Kazakhstan", continent: "Asia" },
  // Americas
  { id: 61, title: "Calgary", location: "Canada", continent: "Americas" },
  { id: 62, title: "Ottawa", location: "Canada", continent: "Americas" },
  { id: 63, title: "Quebec City", location: "Canada", continent: "Americas" },
  { id: 64, title: "Guadalajara", location: "Mexico", continent: "Americas" },
  { id: 65, title: "Cancun", location: "Mexico", continent: "Americas" },
  { id: 66, title: "Cusco", location: "Peru", continent: "Americas" },
  { id: 67, title: "Valparaiso", location: "Chile", continent: "Americas" },
  { id: 68, title: "Barranquilla", location: "Colombia", continent: "Americas" },
  { id: 69, title: "Cartagena", location: "Colombia", continent: "Americas" },
  { id: 70, title: "Cali", location: "Colombia", continent: "Americas" },
  { id: 71, title: "Quito", location: "Ecuador", continent: "Americas" },
  { id: 72, title: "Montevideo", location: "Uruguay", continent: "Americas" },
  { id: 73, title: "La Paz", location: "Bolivia", continent: "Americas" },
  { id: 74, title: "Asunción", location: "Paraguay", continent: "Americas" },
  { id: 75, title: "San Juan", location: "Puerto Rico", continent: "Americas" },
  { id: 76, title: "Trinidad", location: "Cuba", continent: "Americas" },
  // Africa
  { id: 77, title: "Mombasa", location: "Kenya", continent: "Africa" },
  { id: 78, title: "Dar es Salaam", location: "Tanzania", continent: "Africa" },
  { id: 79, title: "Alexandria", location: "Egypt", continent: "Africa" },
  { id: 80, title: "Luxor", location: "Egypt", continent: "Africa" },
  { id: 81, title: "Casablanca", location: "Morocco", continent: "Africa" },
  { id: 82, title: "Lagos", location: "Nigeria", continent: "Africa" },
  { id: 83, title: "Kumasi", location: "Ghana", continent: "Africa" },
  { id: 84, title: "Addis Ababa", location: "Ethiopia", continent: "Africa" },
  { id: 85, title: "Entebbe", location: "Uganda", continent: "Africa" },
  { id: 86, title: "Kigali", location: "Rwanda", continent: "Africa" }
];

// Popular destinations and countries constants
export const POPULAR_DESTINATION_IDS = [
  // Europe
  1, 2, 3, 4, 5, 6, // Paris, Barcelona, Prague, Amsterdam, Rome, Berlin
  // Asia
  7, 14, 15, 16, // Tokyo, Bangkok, Bali, Seoul
  // Americas
  8, 9, 11, // NYC, LA, Rio
  // Africa
  17, 18, 19 // Cape Town, Marrakech, Serengeti
];
export const POPULAR_COUNTRY_NAMES = ['USA', 'Croatia', 'Italy', 'France', 'Spain', 'Brazil', 'Germany', 'Japan', 'South Africa', 'Morocco', 'Thailand', 'Indonesia', 'South Korea'];

// ======================================================================
// HELPER FUNCTIONS - These need to be implemented as backend API endpoints
// See implementation guide at top of file
// ======================================================================

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
  return destinations.filter(destination => destination.budgetPerDay && destination.budgetPerDay <= maxBudget);
};

export const getDestinationsByContinent = (continent: string): Destination[] => {
  return destinations.filter(destination => 
    destination.continent.toLowerCase() === continent.toLowerCase()
  );
};

/**
 * Get popular destinations, optionally filtered by continent
 * @param continent Optional continent filter
 * @returns Array of popular destinations in priority order
 */
export const getPopularDestinations = (continent?: string): Destination[] => {
  const filtered = continent 
    ? destinations.filter(dest => dest.continent === continent)
    : destinations;
  
  return filtered
    .filter(dest => POPULAR_DESTINATION_IDS.includes(dest.id))
    .sort((a, b) => POPULAR_DESTINATION_IDS.indexOf(a.id) - POPULAR_DESTINATION_IDS.indexOf(b.id));
};

/**
 * Get popular countries based on available destinations, optionally filtered by continent
 * @param continent Optional continent filter
 * @returns Array of popular country names in priority order
 */
export const getPopularCountries = (continent?: string): string[] => {
  const filtered = continent 
    ? destinations.filter(dest => dest.continent === continent)
    : destinations;
  
  const uniqueCountries = Array.from(new Set(filtered.map(dest => dest.location)))
    .filter(loc => POPULAR_COUNTRY_NAMES.includes(loc));
  
  return uniqueCountries.sort((a, b) => POPULAR_COUNTRY_NAMES.indexOf(a) - POPULAR_COUNTRY_NAMES.indexOf(b));
};
