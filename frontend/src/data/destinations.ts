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
    imageUrl: "https://images.unsplash.com/photo-1753184657335-b54123c2349b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=735",
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
  }
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
