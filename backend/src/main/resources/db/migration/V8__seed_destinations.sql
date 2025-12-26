-- V8__seed_destinations.sql
-- Seed destinations (FULL + MINIMAL) with fixed IDs (matching FE)

INSERT INTO destinations (
    id, title, location, continent,
    image_url, image_alt,
    overview, budget_per_day, why_visit, student_perks
)
VALUES
-- ===================================================================
-- FULL DESTINATIONS (IDs 1-30)
-- ===================================================================
(1, 'Paris', 'France', 'Europe',
 'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
 'Paris, France',
 'The City of Light, home to the Eiffel Tower, Louvre Museum, and world-class cuisine. Experience romance, art, and history in every corner.',
 50,
 'Paris is the ultimate student destination with its rich history, world-renowned museums, and vibrant café culture. Perfect for art lovers, food enthusiasts, and anyone seeking inspiration.',
 ARRAY[
   'Free entry to many museums with student ID',
   'Discounted metro passes for students',
   'Affordable hostels and student accommodations',
   'Student-friendly cafés and restaurants',
   'Free walking tours available daily'
 ]),

(2, 'Barcelona', 'Spain', 'Europe',
 'https://images.unsplash.com/photo-1583422409516-2895a77efded?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
 'Barcelona, Spain',
 'Architectural masterpieces by Gaudí, beautiful beaches, and vibrant nightlife. Barcelona combines art, history, and Mediterranean charm.',
 45,
 'Barcelona offers the perfect mix of beach life, incredible architecture, and vibrant student culture. Great for students who love art, history, and social experiences.',
 ARRAY[
   'Student discounts at Gaudí sites',
   'Affordable beachside accommodations',
   'Free walking tours and cultural events',
   'Student-friendly tapas bars',
   'Discounted public transport passes'
 ]),

(3, 'Prague', 'Czech Republic', 'Europe',
 'https://images.unsplash.com/photo-1564511287568-54483b52a35e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
 'Prague, Czech Republic',
 'The Golden City with stunning Gothic architecture, rich history, and affordable prices. A fairy-tale destination for budget-conscious travelers.',
 30,
 'Prague is incredibly budget-friendly while offering stunning architecture and rich history. Perfect for students who want to experience Europe without breaking the bank.',
 ARRAY[
   'Extremely affordable accommodations',
   'Free walking tours and historical sites',
   'Budget-friendly local cuisine',
   'Student discounts at museums and attractions',
   'Affordable public transport and beer culture'
 ]),

(4, 'Amsterdam', 'Netherlands', 'Europe',
 'https://images.unsplash.com/photo-1584003564911-a7a321c84e1c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=984',
 'Amsterdam, Netherlands',
 'Canals, bicycles, world-class museums, and a unique liberal culture. Amsterdam offers a perfect blend of history, art, and modern lifestyle.',
 55,
 'Amsterdam''s bike-friendly culture, world-class museums, and unique atmosphere make it perfect for students interested in art, history, and sustainable living.',
 ARRAY[
   'Student discounts at major museums',
   'Affordable bike rentals',
   'Student-friendly hostels and accommodations',
   'Free walking tours and cultural events',
   'Discounted public transport with student card'
 ]),

(5, 'Rome', 'Italy', 'Europe',
 'https://plus.unsplash.com/premium_photo-1675975706513-9daba0ec12a8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
 'Rome, Italy',
 'The Eternal City, where ancient history meets vibrant modern life. Explore the Colosseum, Vatican City, and indulge in authentic Italian cuisine.',
 40,
 'Rome offers an unparalleled journey through history, art, and culture. Perfect for students fascinated by ancient civilizations, architecture, and incredible food.',
 ARRAY[
   'Student discounts at major historical sites',
   'Affordable pizzerias and gelato shops',
   'Free entry to Vatican Museums for students',
   'Budget-friendly accommodations',
   'Discounted public transport cards'
 ]),

(6, 'Berlin', 'Germany', 'Europe',
 'https://images.unsplash.com/photo-1560969184-10fe8719e047?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
 'Berlin, Germany',
 'A city of contrasts, from historic monuments to cutting-edge art and nightlife. Experience dynamic culture and rich history in Germany''s capital.',
 35,
 'Berlin''s vibrant art scene, affordable living, and fascinating history make it perfect for students interested in culture, history, and social experiences.',
 ARRAY[
   'Very affordable hostels and accommodations',
   'Student discounts at museums and galleries',
   'Budget-friendly street food scene',
   'Free walking tours available',
   'Affordable public transport'
 ]),

(7, 'Tokyo', 'Japan', 'Asia',
 'https://plus.unsplash.com/premium_photo-1661914240950-b0124f20a5c1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
 'Tokyo, Japan',
 'A mesmerizing blend of ancient traditions and cutting-edge technology. From serene temples to neon-lit streets, Tokyo offers endless adventures.',
 40,
 'Tokyo provides an incredible cultural experience with its unique blend of traditional and modern Japan. Perfect for students interested in technology, culture, and amazing food.',
 ARRAY[
   'Student discounts at major attractions',
   'Affordable capsule hotels and hostels',
   'JR Pass discounts for students',
   'Free temple visits and cultural experiences',
   'Budget-friendly ramen and street food'
 ]),

(8, 'New York City', 'USA', 'Americas',
 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
 'New York City, USA',
 'The city that never sleeps offers world-class museums, Broadway shows, and diverse neighborhoods. Experience the energy of the Big Apple.',
 60,
 'NYC provides endless opportunities for students with its world-class cultural institutions, diverse food scene, and vibrant student life.',
 ARRAY[
   'Student discounts at museums and Broadway shows',
   'Affordable Broadway ticket lotteries',
   'Budget-friendly food trucks and markets',
   'Student ID discounts at attractions',
   'Free events and concerts in parks'
 ]),

(9, 'Los Angeles', 'USA', 'Americas',
 'https://images.unsplash.com/flagged/photo-1575555201693-7cd442b8023f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1632',
 'Los Angeles, USA',
 'Sunny beaches, Hollywood dreams, and diverse cultures. LA offers incredible food, iconic landmarks, and endless entertainment.',
 50,
 'LA provides a mix of beach life, entertainment industry access, and diverse cultural experiences perfect for adventurous students.',
 ARRAY[
   'Free days at museums and galleries',
   'Affordable student accommodations',
   'Discounted movie tickets for students',
   'Budget-friendly taco trucks and food courts',
   'Free beach access and outdoor activities'
 ]),

(10, 'Toronto', 'Canada', 'Americas',
 'https://images.unsplash.com/photo-1543962226-818f4301073f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1907',
 'Toronto, Canada',
 'Canada''s largest city offers incredible diversity, world-class museums, and a welcoming atmosphere for international students.',
 45,
 'Toronto''s multicultural environment, affordable cultural activities, and friendly atmosphere make it perfect for international students.',
 ARRAY[
   'Student discounts at CN Tower and museums',
   'Affordable international cuisine',
   'Free community events and festivals',
   'Student-friendly hostels and accommodations',
   'Discounted public transit with student card'
 ]),

(11, 'Rio de Janeiro', 'Brazil', 'Americas',
 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
 'Rio de Janeiro, Brazil',
 'The Marvelous City with stunning beaches, vibrant samba culture, and iconic landmarks. Experience the energy of Carnival''s hometown.',
 35,
 'Rio offers an incredible mix of natural beauty, vibrant culture, and world-class beaches. Perfect for students who love music, dance, and outdoor adventures.',
 ARRAY[
   'Affordable beachside accommodations',
   'Student discounts at major attractions',
   'Budget-friendly local food and churrasco',
   'Free or cheap beach activities and hiking',
   'Discounted public transport passes'
 ]),

(12, 'Mexico City', 'Mexico', 'Americas',
 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
 'Mexico City, Mexico',
 'A vibrant metropolis rich in history, art, and incredible cuisine. Explore ancient Aztec temples, world-class museums, and bustling markets.',
 30,
 'Mexico City offers incredible value with its rich culture, amazing food scene, and vibrant student culture. Perfect for students on a budget.',
 ARRAY[
   'Very affordable accommodations and food',
   'Student discounts at museums and historical sites',
   'Incredibly cheap street food and local eateries',
   'Free cultural events and festivals',
   'Budget-friendly public transport'
 ]),

(13, 'Punta Cana', 'Dominican Republic', 'Americas',
 'https://images.unsplash.com/photo-1569700946659-fe1941c71fe4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
 'Punta Cana, Dominican Republic',
 'Paradise beaches, turquoise waters, and all-inclusive resorts. Perfect for students seeking sun, sand, and tropical adventures.',
 40,
 'Punta Cana offers stunning Caribbean beaches and incredible all-inclusive deals. Perfect for students who want a tropical getaway without breaking the bank.',
 ARRAY[
   'All-inclusive student-friendly packages',
   'Affordable beach activities and watersports',
   'Free beach access and public spaces',
   'Budget-friendly local food and drinks',
   'Student discounts on tours and excursions'
 ]),

(14, 'Bangkok', 'Thailand', 'Asia',
 'https://images.unsplash.com/photo-1513568720563-6a5b8c6caab3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1144',
 'Bangkok, Thailand',
 'A vibrant city where ancient temples meet modern life. Discover golden palaces, floating markets, and incredible street food for unbeatable prices.',
 25,
 'Bangkok offers incredible value with its rich culture, amazing food, and affordable prices. Perfect for budget-conscious students seeking adventure.',
 ARRAY[
   'Extremely affordable accommodations and food',
   'Very cheap public transport and tuk-tuks',
   'Budget-friendly street food everywhere',
   'Affordable temple visits and cultural sites',
   'Student-friendly nightlife and markets'
 ]),

(15, 'Bali', 'Indonesia', 'Asia',
 'https://images.unsplash.com/photo-1604999333679-b86d54738315?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1025',
 'Bali, Indonesia',
 'Tropical paradise with stunning beaches, lush rice terraces, and spiritual culture. Experience yoga, surfing, and incredible nature on a student budget.',
 20,
 'Bali offers paradise-level experiences at incredibly affordable prices. Perfect for students who love nature, culture, and adventure.',
 ARRAY[
   'Very affordable accommodations and hostels',
   'Cheap local food and warungs',
   'Free beach access everywhere',
   'Affordable surf rentals and lessons',
   'Budget-friendly temple visits and activities'
 ]),

(16, 'Seoul', 'South Korea', 'Asia',
 'https://plus.unsplash.com/premium_photo-1661948404806-391a240d6d40?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1172',
 'Seoul, South Korea',
 'Where ancient palaces meet K-pop culture. Experience incredible food, cutting-edge technology, and vibrant student neighborhoods.',
 35,
 'Seoul perfectly combines tradition and modernity with amazing food, affordable prices, and vibrant youth culture.',
 ARRAY[
   'Affordable student accommodations',
   'Very cheap and delicious Korean BBQ',
   'Budget-friendly public transport',
   'Free cultural experiences and temples',
   'Student discounts at major attractions'
 ]),

(17, 'Cape Town', 'South Africa', 'Africa',
 'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
 'Cape Town, South Africa',
 'Stunning natural beauty, vibrant culture, and incredible wildlife. From Table Mountain to penguin beaches, Cape Town offers unique experiences.',
 30,
 'Cape Town provides incredible value with its stunning landscapes, diverse culture, and affordable prices. Perfect for adventurous students.',
 ARRAY[
   'Affordable accommodations in great locations',
   'Student-friendly food and markets',
   'Budget-friendly public transport',
   'Free or cheap hiking and outdoor activities',
   'Affordable wildlife and cultural tours'
 ]),

(18, 'Marrakech', 'Morocco', 'Africa',
 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1524',
 'Marrakech, Morocco',
 'A sensory explosion of colors, sounds, and aromas. Explore bustling souks, stunning palaces, and nearby desert adventures.',
 25,
 'Marrakech offers rich culture, incredible food, and amazing value. Perfect for students seeking exotic experiences on a budget.',
 ARRAY[
   'Very affordable accommodations in riads',
   'Budget-friendly local cuisine and tea',
   'Affordable souk shopping and markets',
   'Student discounts at historical sites',
   'Cheap desert tours and activities'
 ]),

(19, 'Serengeti National Park', 'Tanzania', 'Africa',
 'https://plus.unsplash.com/premium_photo-1661936361131-c421746dcd0d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2159',
 'Serengeti National Park, Tanzania',
 'Witness the Great Migration, Big Five, and endless savannas. Experience the raw beauty of African wildlife in their natural habitat.',
 45,
 'Tanzania offers one of the world''s greatest wildlife experiences at an unforgettable price. Perfect for students passionate about nature and wildlife.',
 ARRAY[
   'Budget-friendly camping safaris',
   'Student group discounts for tours',
   'Affordable park entrance fees',
   'Shared accommodation options available',
   'Camping and budget lodge packages'
 ]),

(20, 'Zagreb', 'Croatia', 'Europe',
 'https://plus.unsplash.com/premium_photo-1661963915825-9dee778ad548?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
 'Zagreb, Croatia',
 'Croatia''s capital blends Austro-Hungarian architecture with modern culture. Beautiful parks, museums, and a vibrant cafe scene. The perfect introduction to Croatian urban life.',
 40,
 'Zagreb offers world-class museums, beautiful architecture, and vibrant student culture at great prices. Perfect for history lovers, art enthusiasts, and anyone seeking an authentic Croatian city experience.',
 ARRAY[
   'Student discounts at museums and galleries',
   'Very affordable hostels and cafes',
   'Free walking tours available daily',
   'Budget-friendly public transport',
   'Student-friendly nightlife and restaurants'
 ]),

(21, 'Rijeka', 'Croatia', 'Europe',
 'https://images.unsplash.com/photo-1645356753760-b61ef173c917?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
 'Rijeka, Croatia',
 'Croatia''s largest port city with rich maritime history, vibrant cultural scene, and stunning Kvarner Bay views. A perfect blend of urban energy and coastal charm.',
 35,
 'Rijeka offers authentic Croatian culture without the tourist crowds. Perfect for students who want beautiful Adriatic views, historic architecture, and vibrant nightlife at affordable prices.',
 ARRAY[
   'Very affordable accommodations in the city center',
   'Student-friendly restaurants and cafes',
   'Free walking tours of historic sites',
   'Budget-friendly public transport',
   'Cheap ferry connections to nearby islands'
 ]),

(22, 'Petrinja', 'Croatia', 'Europe',
 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Petrinja_ulica.jpg',
 'Petrinja, Croatia',
 'A charming historic town in continental Croatia known for its wine region, traditional architecture, and rich cultural heritage. Experience authentic inland Croatian life.',
 25,
 'Petrinja offers an authentic Croatian experience away from the coast. Perfect for students interested in history, wine culture, and exploring lesser-known destinations with budget-friendly prices.',
 ARRAY[
   'Extremely affordable accommodations',
   'Local wine tastings at great prices',
   'Historical sites and museums',
   'Traditional Croatian cuisine at budget prices',
   'Less touristy, more authentic experience'
 ]),

(23, 'Silba', 'Croatia', 'Europe',
 'https://www.yachtscroatia.hr/var/site/storage/images/_aliases/i1920/6/7/6/5/245676-14-cro-HR/1b7d205a1ed0-Otok-Silba-01.jpg.webp',
 'Silba, Croatia',
 'A tiny car-free island paradise in the Adriatic. Sandy beaches, crystal-clear waters, and peaceful island life. Perfect for digital nomads and solo travelers seeking tranquility.',
 30,
 'Silba offers the ultimate island escape with no cars, stunning beaches, and a peaceful atmosphere. Perfect for students who want to disconnect and enjoy Croatia''s natural beauty on a budget.',
 ARRAY[
   'Very affordable private rooms and hostels',
   'Free beach access everywhere',
   'Cheap local restaurants and konoba',
   'No transport costs - walkable island',
   'Perfect for water sports and snorkeling'
 ]),

(24, 'Vienna', 'Austria', 'Europe',
 'https://plus.unsplash.com/premium_photo-1716932567535-6bb42a3f38ff?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1632',
 'Vienna, Austria',
 'The City of Music with stunning palaces, world-class museums, and coffee house culture. Experience imperial grandeur and modern art on a student budget.',
 45,
 'Vienna combines imperial history with vibrant modern culture. Perfect for students who love classical music, art, and beautiful architecture.',
 ARRAY[
   'Student discounts at museums and palaces',
   'Affordable cafe culture everywhere',
   'Budget-friendly student accommodations',
   'Free classical music concerts',
   'Discounted public transport passes'
 ]),

(25, 'Budapest', 'Hungary', 'Europe',
 'https://images.unsplash.com/photo-1616432902940-b7a1acbc60b3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070',
 'Budapest, Hungary',
 'The Pearl of the Danube with thermal baths, stunning architecture, and incredible nightlife. Experience history, culture, and affordability in this beautiful city.',
 30,
 'Budapest offers incredible value with its thermal baths, stunning architecture, and vibrant student culture. Perfect for budget-conscious students who love history and nightlife.',
 ARRAY[
   'Extremely affordable accommodations',
   'Student discounts at thermal baths',
   'Budget-friendly Hungarian cuisine',
   'Free walking tours and historical sites',
   'Affordable public transport'
 ]),

(26, 'Stockholm', 'Sweden', 'Europe',
 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?ixlib=rb-4.1.https://images.unsplash.com/photo-1588653818221-2651ec1a6423?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1171',
 'Stockholm, Sweden',
 'A beautiful archipelago city with stunning design, museums, and vibrant culture. Experience Swedish lifestyle and modern Scandinavian architecture.',
 50,
 'Stockholm offers world-class design, beautiful scenery, and a unique Scandinavian experience. Perfect for students interested in sustainability, design, and nature.',
 ARRAY[
   'Student discounts at museums and attractions',
   'Affordable student accommodations',
   'Free walking tours and cultural events',
   'Budget-friendly Swedish food',
   'Discounted public transport passes'
 ]),

(27, 'Shanghai', 'China', 'Asia',
 'https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
 'Shanghai, China',
 'A futuristic metropolis where ancient meets ultra-modern. Experience stunning skylines, incredible food, and vibrant youth culture.',
 35,
 'Shanghai offers an incredible mix of old and new China with amazing food, stunning architecture, and affordable prices for students.',
 ARRAY[
   'Affordable street food everywhere',
   'Student discounts at attractions',
   'Budget-friendly public transport',
   'Free cultural experiences and parks',
   'Cheap accommodation options'
 ]),

(28, 'Singapore', 'Singapore', 'Asia',
 'https://images.unsplash.com/photo-1605425183435-25b7e99104a4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=764',
 'Singapore',
 'A clean, modern city-state with amazing food, stunning architecture, and perfect public transport. Experience diverse cultures and world-class attractions.',
 45,
 'Singapore offers incredible food, stunning architecture, and a unique blend of cultures. Perfect for students who love modern cities with traditional charm.',
 ARRAY[
   'Student discounts at major attractions',
   'Affordable hawker centers everywhere',
   'Excellent and cheap public transport',
   'Free parks and outdoor activities',
   'Student-friendly hostels and accommodations'
 ]),

(29, 'São Paulo', 'Brazil', 'Americas',
 'https://images.unsplash.com/photo-1543059080-f9b1272213d5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074',
 'São Paulo, Brazil',
 'South America''s largest city offers incredible diversity, world-class food, and vibrant nightlife. Experience authentic Brazilian culture at great prices.',
 30,
 'São Paulo offers amazing food, vibrant culture, and incredible value. Perfect for students who love music, food, and authentic experiences.',
 ARRAY[
   'Extremely affordable accommodations',
   'Incredibly cheap and delicious food',
   'Free street festivals and events',
   'Budget-friendly public transport',
   'Student discounts at museums and attractions'
 ]),

(30, 'Buenos Aires', 'Argentina', 'Americas',
 'https://plus.unsplash.com/premium_photo-1697729901052-fe8900e24993?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1633',
 'Buenos Aires, Argentina',
 'The Paris of South America with stunning architecture, incredible tango culture, and amazing food. Experience vibrant street life and rich culture.',
 35,
 'Buenos Aires offers incredible value with its European charm, amazing food, and vibrant student culture. Perfect for students who love culture and nightlife.',
 ARRAY[
   'Very affordable accommodations and food',
   'Student discounts at cultural attractions',
   'Free tango shows and street performances',
   'Budget-friendly parrillas and cafes',
   'Cheap public transport'
 ]),

-- ===================================================================
-- MORE FULL DESTINATIONS (IDs 87-119) - as in FE snippet
-- ===================================================================
(87, 'London', 'United Kingdom', 'Europe',
 'https://images.unsplash.com/photo-1500380804539-4e1e8c1e7118?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
 'London, United Kingdom',
 'The historic capital with world-class museums, royal palaces, and diverse culture. Experience centuries of history, cutting-edge art, and vibrant student life.',
 55,
 'London offers unparalleled cultural experiences, world-class universities, and vibrant student neighborhoods. Perfect for students who love history, art, and multicultural experiences.',
 ARRAY[
   'Free entry to many world-class museums',
   'Student discounts at attractions and theaters',
   'Affordable student accommodations in great neighborhoods',
   'Student Oyster card discounts for public transport',
   'Budget-friendly markets and food halls'
 ]),

(88, 'Dublin', 'Ireland', 'Europe',
 'https://images.unsplash.com/photo-1634499282463-274002e296a9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1632',
 'Dublin, Ireland',
 'The friendly capital known for its literary heritage, lively pubs, and welcoming atmosphere. Experience rich history, music, and vibrant student culture.',
 45,
 'Dublin offers a warm welcome, rich literary culture, and vibrant student life. Perfect for students who love literature, music, and friendly local culture.',
 ARRAY[
   'Student discounts at historical sites and museums',
   'Affordable student accommodations',
   'Budget-friendly pub culture and food',
   'Free walking tours and cultural events',
   'Student discounts on public transport'
 ]),

(89, 'Lisbon', 'Portugal', 'Europe',
 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1173',
 'Lisbon, Portugal',
 'A stunning coastal capital with colorful tiles, historic trams, and incredible food. Experience beautiful architecture, vibrant neighborhoods, and affordable prices.',
 35,
 'Lisbon offers incredible value with its stunning beauty, amazing food, and vibrant culture. Perfect for students who love coastal cities, history, and affordable European experiences.',
 ARRAY[
   'Very affordable accommodations and food',
   'Student discounts at attractions and museums',
   'Budget-friendly public transport',
   'Free walking tours and cultural events',
   'Affordable seafood and local cuisine'
 ]),

(90, 'Copenhagen', 'Denmark', 'Europe',
 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
 'Copenhagen, Denmark',
 'The world''s happiest city with stunning design, bike-friendly streets, and incredible food scene. Experience Scandinavian lifestyle and modern sustainability.',
 50,
 'Copenhagen offers world-class design, sustainable living, and incredible food culture. Perfect for students interested in sustainability, design, and Scandinavian lifestyle.',
 ARRAY[
   'Student discounts at museums and attractions',
   'Affordable bike rentals and public transport',
   'Budget-friendly student accommodations',
   'Free cultural events and festivals',
   'Student-friendly food markets and cafes'
 ]),

(91, 'Oslo', 'Norway', 'Europe',
 'https://plus.unsplash.com/premium_photo-1733259769233-72fe12c32433?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074',
 'Oslo, Norway',
 'A beautiful capital surrounded by fjords and forests. Experience stunning natural beauty, world-class museums, and modern Scandinavian architecture.',
 55,
 'Oslo offers incredible natural beauty, world-class museums, and a unique Scandinavian experience. Perfect for students who love nature, art, and outdoor activities.',
 ARRAY[
   'Student discounts at museums and attractions',
   'Affordable student accommodations',
   'Free access to many outdoor activities',
   'Discounted public transport passes',
   'Student-friendly food markets'
 ]),

(92, 'Helsinki', 'Finland', 'Europe',
 'https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
 'Helsinki, Finland',
 'A modern design capital with stunning architecture, sauna culture, and beautiful archipelago. Experience Finnish lifestyle and cutting-edge design.',
 50,
 'Helsinki offers world-class design, unique sauna culture, and beautiful nature. Perfect for students interested in design, technology, and Nordic experiences.',
 ARRAY[
   'Student discounts at museums and attractions',
   'Affordable student accommodations',
   'Budget-friendly public transport',
   'Free cultural events and festivals',
   'Student-friendly cafes and markets'
 ]),

(93, 'Reykjavik', 'Iceland', 'Europe',
 'https://images.unsplash.com/photo-1606130503037-6a8ef67c9d2d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1625',
 'Reykjavik, Iceland',
 'A small capital with incredible natural wonders nearby. Experience geysers, waterfalls, Northern Lights, and unique Icelandic culture.',
 60,
 'Iceland offers once-in-a-lifetime natural experiences with geysers, waterfalls, and Northern Lights. Perfect for adventurous students who love nature and unique cultures.',
 ARRAY[
   'Student discounts at attractions and tours',
   'Affordable student accommodations',
   'Budget-friendly grocery stores',
   'Student discounts on tours and activities',
   'Free natural attractions and hiking'
 ]),

(94, 'Warsaw', 'Poland', 'Europe',
 'https://images.unsplash.com/photo-1607078486875-a697a8a38e87?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
 'Warsaw, Poland',
 'A resilient capital that rebuilt from ruins. Experience rich history, vibrant culture, and incredible value. Perfect blend of old and new Europe.',
 30,
 'Warsaw offers incredible value with its rich history, vibrant culture, and affordable prices. Perfect for budget-conscious students who love history and culture.',
 ARRAY[
   'Extremely affordable accommodations and food',
   'Student discounts at museums and attractions',
   'Budget-friendly public transport',
   'Free walking tours and cultural events',
   'Very cheap local cuisine and cafes'
 ]),

(95, 'Athens', 'Greece', 'Europe',
 'https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
 'Athens, Greece',
 'The ancient capital where history comes alive. Explore ancient ruins, world-class museums, and vibrant neighborhoods with incredible food.',
 35,
 'Athens offers incredible history, amazing food, and great value. Perfect for students fascinated by ancient civilizations, mythology, and Mediterranean culture.',
 ARRAY[
   'Student discounts at archaeological sites',
   'Very affordable accommodations and food',
   'Free entry to many museums with student ID',
   'Budget-friendly public transport',
   'Cheap and delicious Greek cuisine'
 ]),

(96, 'Istanbul', 'Turkey', 'Europe',
 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1170',
 'Istanbul, Turkey',
 'A city spanning two continents with incredible history, stunning architecture, and amazing food. Experience the bridge between Europe and Asia.',
 30,
 'Istanbul offers incredible value with its rich history, stunning architecture, and amazing food. Perfect for students who love culture, history, and unique experiences.',
 ARRAY[
   'Very affordable accommodations and food',
   'Student discounts at historical sites',
   'Budget-friendly public transport',
   'Free walking tours and cultural events',
   'Incredibly cheap and delicious Turkish cuisine'
 ]),

(97, 'Brussels', 'Belgium', 'Europe',
 'https://images.unsplash.com/photo-1701013694884-a278c7acea5c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1077',
 'Brussels, Belgium',
 'The European capital with stunning architecture, world-class beer, and incredible chocolate. Experience rich culture and vibrant international atmosphere.',
 45,
 'Brussels offers incredible food culture, beautiful architecture, and vibrant international atmosphere. Perfect for students interested in European politics, culture, and cuisine.',
 ARRAY[
   'Student discounts at museums and attractions',
   'Affordable student accommodations',
   'Budget-friendly public transport',
   'Free cultural events and festivals',
   'Student-friendly food markets and cafes'
 ]),

(98, 'Zurich', 'Switzerland', 'Europe',
 'https://images.unsplash.com/photo-1620563092215-0fbc6b55cfc5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1171',
 'Zurich, Switzerland',
 'A stunning lakeside city with incredible natural beauty, world-class museums, and pristine cleanliness. Experience Swiss precision and Alpine beauty.',
 60,
 'Zurich offers stunning natural beauty, world-class cultural institutions, and a unique Swiss experience. Perfect for students who love nature, culture, and quality.',
 ARRAY[
   'Student discounts at museums and attractions',
   'Affordable student accommodations',
   'Discounted public transport passes',
   'Free cultural events and festivals',
   'Student-friendly food options'
 ]),

(99, 'Bucharest', 'Romania', 'Europe',
 'https://images.unsplash.com/photo-1564336899707-dd34a4b165d7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1143',
 'Bucharest, Romania',
 'The Paris of the East with stunning architecture, vibrant nightlife, and incredible value. Experience a mix of Eastern European charm and modern culture.',
 25,
 'Bucharest offers incredible value with its beautiful architecture, vibrant culture, and extremely affordable prices. Perfect for budget-conscious students who love culture and nightlife.',
 ARRAY[
   'Extremely affordable accommodations and food',
   'Student discounts at attractions',
   'Budget-friendly public transport',
   'Free cultural events and festivals',
   'Very cheap local cuisine and cafes'
 ]),

(100, 'Delhi', 'India', 'Asia',
 'https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
 'Delhi, India',
 'A vibrant capital where ancient history meets modern life. Experience incredible food, stunning monuments, and rich culture at unbeatable prices.',
 20,
 'Delhi offers incredible value with its rich history, amazing food, and vibrant culture. Perfect for students who love history, food, and authentic cultural experiences.',
 ARRAY[
   'Extremely affordable accommodations and food',
   'Student discounts at historical sites',
   'Budget-friendly public transport',
   'Free cultural events and festivals',
   'Incredibly cheap and delicious street food'
 ]),

(101, 'Ho Chi Minh City', 'Vietnam', 'Asia',
 'https://images.unsplash.com/photo-1521019795854-14e15f600980?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1632',
 'Ho Chi Minh City, Vietnam',
 'A vibrant metropolis with rich history, incredible street food, and bustling energy. Experience authentic Vietnamese culture and amazing value.',
 20,
 'Ho Chi Minh City offers incredible value with amazing food, rich history, and vibrant culture. Perfect for budget-conscious students who love food and authentic experiences.',
 ARRAY[
   'Extremely affordable accommodations and food',
   'Student discounts at attractions',
   'Budget-friendly public transport and motorbikes',
   'Free cultural events and festivals',
   'Incredibly cheap and delicious Vietnamese cuisine'
 ]),

(102, 'Kuala Lumpur', 'Malaysia', 'Asia',
 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1170',
 'Kuala Lumpur, Malaysia',
 'A modern metropolis with stunning skyscrapers, incredible food, and diverse culture. Experience the perfect blend of traditional and modern Asia.',
 25,
 'Kuala Lumpur offers incredible value with amazing food, modern attractions, and diverse culture. Perfect for students who love modern cities with traditional charm.',
 ARRAY[
   'Very affordable accommodations and food',
   'Student discounts at attractions',
   'Budget-friendly public transport',
   'Free cultural events and festivals',
   'Cheap and delicious Malaysian cuisine'
 ]),

(103, 'Manila', 'Philippines', 'Asia',
 'https://images.unsplash.com/photo-1655016268120-383558788b37?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1171',
 'Manila, Philippines',
 'A vibrant capital with rich history, incredible food, and friendly locals. Experience authentic Filipino culture and amazing value.',
 20,
 'Manila offers incredible value with amazing food, rich culture, and friendly atmosphere. Perfect for students who love authentic experiences and tropical vibes.',
 ARRAY[
   'Extremely affordable accommodations and food',
   'Student discounts at attractions',
   'Budget-friendly public transport',
   'Free cultural events and festivals',
   'Very cheap and delicious Filipino cuisine'
 ]),

(104, 'Taipei', 'Taiwan', 'Asia',
 'https://plus.unsplash.com/premium_photo-1661955975506-04d3812be312?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1171',
 'Taipei, Taiwan',
 'A modern city with incredible food, stunning temples, and vibrant night markets. Experience the perfect blend of traditional and modern Taiwan.',
 30,
 'Taipei offers incredible food, rich culture, and modern amenities at great prices. Perfect for students who love food, technology, and authentic Asian experiences.',
 ARRAY[
   'Affordable accommodations and food',
   'Student discounts at attractions',
   'Budget-friendly public transport',
   'Free cultural events and festivals',
   'Cheap and delicious night market food'
 ]),

(105, 'Hong Kong', 'Hong Kong', 'Asia',
 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1528',
 'Hong Kong',
 'A dynamic city where East meets West. Experience stunning skylines, incredible food, and vibrant culture in this world-class metropolis.',
 40,
 'Hong Kong offers incredible food, stunning views, and unique blend of cultures. Perfect for students who love modern cities, food, and vibrant energy.',
 ARRAY[
   'Student discounts at attractions',
   'Affordable student accommodations',
   'Budget-friendly public transport',
   'Free cultural events and festivals',
   'Affordable food options in local markets'
 ]),

(106, 'Kathmandu', 'Nepal', 'Asia',
 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1933',
 'Kathmandu, Nepal',
 'A spiritual capital surrounded by stunning mountains. Experience ancient temples, rich culture, and incredible natural beauty at amazing prices.',
 15,
 'Kathmandu offers incredible value with its rich culture, spiritual atmosphere, and stunning natural beauty. Perfect for adventurous students who love mountains and culture.',
 ARRAY[
   'Extremely affordable accommodations and food',
   'Student discounts at temples and attractions',
   'Budget-friendly local transport',
   'Free cultural events and festivals',
   'Very cheap and delicious local cuisine'
 ]),

(107, 'Colombo', 'Sri Lanka', 'Asia',
 'https://images.unsplash.com/photo-1653478673261-4937126eb512?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
 'Colombo, Sri Lanka',
 'A coastal capital with colonial architecture, incredible food, and beautiful beaches nearby. Experience authentic Sri Lankan culture and amazing value.',
 20,
 'Colombo offers incredible value with amazing food, beautiful beaches, and rich culture. Perfect for students who love coastal cities, culture, and authentic experiences.',
 ARRAY[
   'Very affordable accommodations and food',
   'Student discounts at attractions',
   'Budget-friendly public transport',
   'Free cultural events and festivals',
   'Cheap and delicious Sri Lankan cuisine'
 ]),

(108, 'Vancouver', 'Canada', 'Americas',
 'https://images.unsplash.com/photo-1559511260-66a654ae982a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1518',
 'Vancouver, Canada',
 'A stunning coastal city surrounded by mountains and ocean. Experience incredible natural beauty, diverse culture, and world-class quality of life.',
 50,
 'Vancouver offers stunning natural beauty, diverse culture, and excellent quality of life. Perfect for students who love nature, outdoor activities, and multicultural experiences.',
 ARRAY[
   'Student discounts at attractions',
   'Affordable student accommodations',
   'Budget-friendly public transport',
   'Free outdoor activities and parks',
   'Student-friendly food options'
 ]),

(109, 'Montreal', 'Canada', 'Americas',
 'https://images.unsplash.com/photo-1613060600794-b4d20def8e02?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1194',
 'Montreal, Canada',
 'A vibrant French-Canadian city with incredible food, rich culture, and beautiful architecture. Experience European charm in North America.',
 40,
 'Montreal offers incredible food, rich culture, and European charm. Perfect for students who love culture, festivals, and vibrant city life.',
 ARRAY[
   'Student discounts at attractions',
   'Affordable student accommodations',
   'Budget-friendly public transport',
   'Free festivals and cultural events',
   'Student-friendly food markets and cafes'
 ]),

(110, 'Sydney', 'Australia', 'Asia',
 'https://images.unsplash.com/photo-1528072164453-f4e8ef0d475a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1171',
 'Sydney, Australia',
 'A stunning harbor city with iconic landmarks, beautiful beaches, and incredible quality of life. Experience outdoor lifestyle and vibrant culture.',
 55,
 'Sydney offers stunning natural beauty, world-class beaches, and excellent quality of life. Perfect for students who love outdoor activities, beaches, and vibrant city life.',
 ARRAY[
   'Student discounts at attractions',
   'Affordable student accommodations',
   'Budget-friendly public transport',
   'Free beach access and outdoor activities',
   'Student-friendly food markets'
 ]),

(111, 'Melbourne', 'Australia', 'Asia',
 'https://plus.unsplash.com/premium_photo-1733317293766-5606f74b765b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074',
 'Melbourne, Australia',
 'A cultural capital known for incredible food, street art, and vibrant arts scene. Experience coffee culture, festivals, and world-class quality of life.',
 50,
 'Melbourne offers incredible food, vibrant arts scene, and excellent quality of life. Perfect for students who love culture, food, and creative experiences.',
 ARRAY[
   'Student discounts at attractions',
   'Affordable student accommodations',
   'Budget-friendly public transport',
   'Free cultural events and festivals',
   'Student-friendly food markets and cafes'
 ]),

(112, 'Auckland', 'New Zealand', 'Asia',
 'https://images.unsplash.com/photo-1515248027005-c33283ec3fba?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1168',
 'Auckland, New Zealand',
 'A stunning harbor city surrounded by volcanoes and islands. Experience incredible natural beauty, outdoor activities, and friendly Kiwi culture.',
 50,
 'Auckland offers stunning natural beauty, outdoor activities, and excellent quality of life. Perfect for students who love nature, adventure, and friendly local culture.',
 ARRAY[
   'Student discounts at attractions',
   'Affordable student accommodations',
   'Budget-friendly public transport',
   'Free outdoor activities and parks',
   'Student-friendly food options'
 ]),

(113, 'Santiago', 'Chile', 'Americas',
 'https://images.unsplash.com/photo-1647618920221-43306af5c58d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074',
 'Santiago, Chile',
 'A modern capital with stunning mountain views, incredible wine, and vibrant culture. Experience the gateway to Chilean adventures.',
 35,
 'Santiago offers incredible value with amazing wine, stunning mountain views, and vibrant culture. Perfect for students who love nature, wine, and South American experiences.',
 ARRAY[
   'Very affordable accommodations and food',
   'Student discounts at attractions',
   'Budget-friendly public transport',
   'Free cultural events and festivals',
   'Affordable Chilean cuisine and wine'
 ]),

(114, 'Bogota', 'Colombia', 'Americas',
 'https://images.unsplash.com/photo-1512617835784-a92626c0a554?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074',
 'Bogota, Colombia',
 'A vibrant capital at high altitude with incredible food, rich culture, and friendly locals. Experience authentic Colombian culture and amazing value.',
 25,
 'Bogota offers incredible value with amazing food, rich culture, and friendly atmosphere. Perfect for students who love culture, food, and authentic South American experiences.',
 ARRAY[
   'Extremely affordable accommodations and food',
   'Student discounts at attractions',
   'Budget-friendly public transport',
   'Free cultural events and festivals',
   'Very cheap and delicious Colombian cuisine'
 ]),

(115, 'Lima', 'Peru', 'Americas',
 'https://images.unsplash.com/photo-1580530719837-952e0515b69a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
 'Lima, Peru',
 'A coastal capital known for world-class cuisine, rich history, and vibrant culture. Experience the gateway to Machu Picchu and incredible food.',
 30,
 'Lima offers incredible food, rich history, and amazing value. Perfect for students who love cuisine, history, and authentic South American experiences.',
 ARRAY[
   'Very affordable accommodations and food',
   'Student discounts at attractions',
   'Budget-friendly public transport',
   'Free cultural events and festivals',
   'Affordable world-class Peruvian cuisine'
 ]),

(116, 'Havana', 'Cuba', 'Americas',
 'https://images.unsplash.com/photo-1500759285222-a95626b934cb?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
 'Havana, Cuba',
 'A time-capsule capital with colorful colonial architecture, vintage cars, and incredible music. Experience authentic Cuban culture and unique atmosphere.',
 30,
 'Havana offers a unique cultural experience with its preserved architecture, vibrant music scene, and authentic atmosphere. Perfect for students who love history, music, and unique experiences.',
 ARRAY[
   'Very affordable accommodations and food',
   'Student discounts at attractions',
   'Budget-friendly local transport',
   'Free cultural events and music',
   'Affordable Cuban cuisine'
 ]),

(117, 'Cairo', 'Egypt', 'Africa',
 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
 'Cairo, Egypt',
 'An ancient capital with incredible pyramids, rich history, and vibrant culture. Experience thousands of years of history and amazing value.',
 25,
 'Cairo offers incredible history, amazing value, and unique cultural experiences. Perfect for students fascinated by ancient civilizations, history, and Middle Eastern culture.',
 ARRAY[
   'Very affordable accommodations and food',
   'Student discounts at historical sites',
   'Budget-friendly public transport',
   'Free cultural events and festivals',
   'Cheap and delicious Egyptian cuisine'
 ]),

(118, 'Nairobi', 'Kenya', 'Africa',
 'https://images.unsplash.com/photo-1635595358293-03620e36be48?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
 'Nairobi, Kenya',
 'A vibrant capital with incredible wildlife nearby, rich culture, and friendly locals. Experience the gateway to African safaris and amazing adventures.',
 30,
 'Nairobi offers incredible wildlife experiences, rich culture, and amazing value. Perfect for adventurous students who love wildlife, nature, and authentic African experiences.',
 ARRAY[
   'Very affordable accommodations and food',
   'Student discounts at attractions',
   'Budget-friendly public transport',
   'Free cultural events and festivals',
   'Affordable local cuisine'
 ]),

(119, 'Accra', 'Ghana', 'Africa',
 'https://images.unsplash.com/photo-1630386226447-af0a955c1009?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1124',
 'Accra, Ghana',
 'A vibrant coastal capital with rich history, incredible music, and friendly locals. Experience authentic West African culture and amazing value.',
 25,
 'Accra offers incredible culture, friendly atmosphere, and amazing value. Perfect for students who love music, history, and authentic West African experiences.',
 ARRAY[
   'Very affordable accommodations and food',
   'Student discounts at attractions',
   'Budget-friendly public transport',
   'Free cultural events and music',
   'Cheap and delicious Ghanaian cuisine'
 ]),

-- ===================================================================
-- MINIMAL DESTINATIONS (IDs 31-86 + extra minimal IDs 135-182)
-- ===================================================================
(31, 'Lyon', 'France', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(32, 'Nice', 'France', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(33, 'Madrid', 'Spain', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(34, 'Porto', 'Portugal', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(35, 'Cork', 'Ireland', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(36, 'Salzburg', 'Austria', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(37, 'Aarhus', 'Denmark', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(38, 'Gothenburg', 'Sweden', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(39, 'Bergen', 'Norway', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(40, 'Tampere', 'Finland', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(41, 'Krakow', 'Poland', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(42, 'Debrecen', 'Hungary', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(43, 'Thessaloniki', 'Greece', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(44, 'Split', 'Croatia', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(45, 'Dubrovnik', 'Croatia', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(46, 'Florence', 'Italy', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(47, 'Venice', 'Italy', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(48, 'Milan', 'Italy', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(49, 'Birmingham', 'United Kingdom', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(50, 'Liverpool', 'United Kingdom', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),

(51, 'Chiang Mai', 'Thailand', 'Asia', NULL, NULL, NULL, NULL, NULL, NULL),
(52, 'Da Nang', 'Vietnam', 'Asia', NULL, NULL, NULL, NULL, NULL, NULL),
(53, 'Hanoi', 'Vietnam', 'Asia', NULL, NULL, NULL, NULL, NULL, NULL),
(54, 'Penang', 'Malaysia', 'Asia', NULL, NULL, NULL, NULL, NULL, NULL),
(55, 'Jakarta', 'Indonesia', 'Asia', NULL, NULL, NULL, NULL, NULL, NULL),
(56, 'Cebu', 'Philippines', 'Asia', NULL, NULL, NULL, NULL, NULL, NULL),
(57, 'Pokhara', 'Nepal', 'Asia', NULL, NULL, NULL, NULL, NULL, NULL),
(58, 'Kandy', 'Sri Lanka', 'Asia', NULL, NULL, NULL, NULL, NULL, NULL),
(59, 'Tashkent', 'Uzbekistan', 'Asia', NULL, NULL, NULL, NULL, NULL, NULL),
(60, 'Almaty', 'Kazakhstan', 'Asia', NULL, NULL, NULL, NULL, NULL, NULL),

(61, 'Calgary', 'Canada', 'Americas', NULL, NULL, NULL, NULL, NULL, NULL),
(62, 'Ottawa', 'Canada', 'Americas', NULL, NULL, NULL, NULL, NULL, NULL),
(63, 'Quebec City', 'Canada', 'Americas', NULL, NULL, NULL, NULL, NULL, NULL),
(64, 'Guadalajara', 'Mexico', 'Americas', NULL, NULL, NULL, NULL, NULL, NULL),
(65, 'Cancun', 'Mexico', 'Americas', NULL, NULL, NULL, NULL, NULL, NULL),
(66, 'Cusco', 'Peru', 'Americas', NULL, NULL, NULL, NULL, NULL, NULL),
(67, 'Valparaiso', 'Chile', 'Americas', NULL, NULL, NULL, NULL, NULL, NULL),
(68, 'Barranquilla', 'Colombia', 'Americas', NULL, NULL, NULL, NULL, NULL, NULL),
(69, 'Cartagena', 'Colombia', 'Americas', NULL, NULL, NULL, NULL, NULL, NULL),
(70, 'Cali', 'Colombia', 'Americas', NULL, NULL, NULL, NULL, NULL, NULL),
(71, 'Quito', 'Ecuador', 'Americas', NULL, NULL, NULL, NULL, NULL, NULL),
(72, 'Montevideo', 'Uruguay', 'Americas', NULL, NULL, NULL, NULL, NULL, NULL),
(73, 'La Paz', 'Bolivia', 'Americas', NULL, NULL, NULL, NULL, NULL, NULL),
(74, 'Asunción', 'Paraguay', 'Americas', NULL, NULL, NULL, NULL, NULL, NULL),
(75, 'San Juan', 'Puerto Rico', 'Americas', NULL, NULL, NULL, NULL, NULL, NULL),
(76, 'Trinidad', 'Cuba', 'Americas', NULL, NULL, NULL, NULL, NULL, NULL),

(77, 'Mombasa', 'Kenya', 'Africa', NULL, NULL, NULL, NULL, NULL, NULL),
(78, 'Dar es Salaam', 'Tanzania', 'Africa', NULL, NULL, NULL, NULL, NULL, NULL),
(79, 'Alexandria', 'Egypt', 'Africa', NULL, NULL, NULL, NULL, NULL, NULL),
(80, 'Luxor', 'Egypt', 'Africa', NULL, NULL, NULL, NULL, NULL, NULL),
(81, 'Casablanca', 'Morocco', 'Africa', NULL, NULL, NULL, NULL, NULL, NULL),
(82, 'Lagos', 'Nigeria', 'Africa', NULL, NULL, NULL, NULL, NULL, NULL),
(83, 'Kumasi', 'Ghana', 'Africa', NULL, NULL, NULL, NULL, NULL, NULL),
(84, 'Addis Ababa', 'Ethiopia', 'Africa', NULL, NULL, NULL, NULL, NULL, NULL),
(85, 'Entebbe', 'Uganda', 'Africa', NULL, NULL, NULL, NULL, NULL, NULL),
(86, 'Kigali', 'Rwanda', 'Africa', NULL, NULL, NULL, NULL, NULL, NULL),

-- extra minimal ids from FE snippet
(135, 'Edinburgh', 'United Kingdom', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(136, 'Manchester', 'United Kingdom', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(137, 'Bristol', 'United Kingdom', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(138, 'Glasgow', 'United Kingdom', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(139, 'Munich', 'Germany', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(140, 'Hamburg', 'Germany', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(141, 'Frankfurt', 'Germany', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(142, 'Cologne', 'Germany', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(143, 'Seville', 'Spain', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(144, 'Valencia', 'Spain', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(145, 'Granada', 'Spain', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(146, 'Marseille', 'France', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(147, 'Toulouse', 'France', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(148, 'Strasbourg', 'France', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(149, 'Naples', 'Italy', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(150, 'Bologna', 'Italy', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(151, 'Turin', 'Italy', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(152, 'Ghent', 'Belgium', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(153, 'Bruges', 'Belgium', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(154, 'Geneva', 'Switzerland', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(155, 'Basel', 'Switzerland', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(156, 'Lucerne', 'Switzerland', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(157, 'Coimbra', 'Portugal', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(158, 'Faro', 'Portugal', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(159, 'Galway', 'Ireland', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(160, 'Limerick', 'Ireland', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(161, 'Odense', 'Denmark', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(162, 'Aalborg', 'Denmark', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(163, 'Trondheim', 'Norway', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(164, 'Stavanger', 'Norway', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(165, 'Oulu', 'Finland', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(166, 'Rovaniemi', 'Finland', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(167, 'Gdansk', 'Poland', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(168, 'Wroclaw', 'Poland', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(169, 'Poznan', 'Poland', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(170, 'Mykonos', 'Greece', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(171, 'Santorini', 'Greece', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(172, 'Rhodes', 'Greece', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(173, 'Ankara', 'Turkey', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(174, 'Izmir', 'Turkey', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(175, 'Antalya', 'Turkey', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(176, 'Cluj-Napoca', 'Romania', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(177, 'Timisoara', 'Romania', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(178, 'Brno', 'Czech Republic', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(179, 'Ostrava', 'Czech Republic', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(180, 'Rotterdam', 'Netherlands', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(181, 'Utrecht', 'Netherlands', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL),
(182, 'The Hague', 'Netherlands', 'Europe', NULL, NULL, NULL, NULL, NULL, NULL)

ON CONFLICT (id) DO UPDATE
SET title          = EXCLUDED.title,
    location       = EXCLUDED.location,
    continent      = EXCLUDED.continent,
    image_url      = EXCLUDED.image_url,
    image_alt      = EXCLUDED.image_alt,
    overview       = EXCLUDED.overview,
    budget_per_day = EXCLUDED.budget_per_day,
    why_visit      = EXCLUDED.why_visit,
    student_perks  = EXCLUDED.student_perks;

-- sync sequence so next insert doesn't collide
SELECT setval(
  pg_get_serial_sequence('destinations', 'id'),
  (SELECT COALESCE(MAX(id), 1) FROM destinations)
);
