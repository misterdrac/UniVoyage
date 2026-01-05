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

(8, 'New York City', 'USA', 'North America',
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

(9, 'Los Angeles', 'USA', 'North America',
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

(10, 'Toronto', 'Canada', 'North America',
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

(11, 'Rio de Janeiro', 'Brazil', 'South America',
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

(12, 'Mexico City', 'Mexico', 'North America',
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

(13, 'Punta Cana', 'Dominican Republic', 'North America',
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

(29, 'São Paulo', 'Brazil', 'South America',
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

(30, 'Buenos Aires', 'Argentina', 'South America',
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

(108, 'Vancouver', 'Canada', 'North America',
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

(109, 'Montreal', 'Canada', 'North America',
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

(110, 'Sydney', 'Australia', 'Oceania',
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

(111, 'Melbourne', 'Australia', 'Oceania',
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

(112, 'Auckland', 'New Zealand', 'Oceania',
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

(113, 'Santiago', 'Chile', 'South America',
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

(114, 'Bogota', 'Colombia', 'South America',
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

(115, 'Lima', 'Peru', 'South America',
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

(116, 'Havana', 'Cuba', 'North America',
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
(31, 'Lyon', 'France', 'Europe',
 'https://images.unsplash.com/photo-1602087594298-706ccc894bfd?q=80&w=3024&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Lyon, France',
 'France''s culinary capital with stunning Renaissance architecture, vibrant food markets, and rich history. Experience world-class gastronomy and beautiful old town charm.',
 45,
 'Lyon offers incredible food culture, beautiful architecture, and student-friendly atmosphere. Perfect for food lovers, history enthusiasts, and students seeking authentic French experiences.',
 ARRAY[
   'Student discounts at museums and attractions',
   'Affordable bouchons (traditional restaurants)',
   'Budget-friendly public transport with student card',
   'Free walking tours in Vieux Lyon',
   'Student-friendly markets and food festivals'
 ]),

(32, 'Nice', 'France', 'Europe',
 'https://images.unsplash.com/photo-1643914729809-4aa59fdc4c17?q=80&w=2274&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Nice, France',
 'The jewel of the French Riviera with stunning beaches, vibrant markets, and Mediterranean charm. Experience sunny weather, beautiful coastline, and Italian influences.',
 50,
 'Nice combines beach life with cultural richness and stunning scenery. Perfect for students who love coastal cities, art, and Mediterranean lifestyle.',
 ARRAY[
   'Student discounts at museums and galleries',
   'Free beach access along the Promenade',
   'Affordable student accommodations near university',
   'Budget-friendly Niçoise cuisine and markets',
   'Discounted public transport passes'
 ]),

(33, 'Madrid', 'Spain', 'Europe',
 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1170',
 'Madrid, Spain',
 'Spain''s vibrant capital with world-class museums, incredible nightlife, and authentic tapas culture. Experience royal palaces, beautiful parks, and energetic street life.',
 40,
 'Madrid offers incredible culture, amazing nightlife, and affordable living. Perfect for students who love art, food, and vibrant social experiences.',
 ARRAY[
   'Free entry to major museums during specific hours',
   'Very affordable tapas bars and restaurants',
   'Student discounts at Prado and Reina Sofia',
   'Budget-friendly metro passes',
   'Cheap student accommodations in great neighborhoods'
 ]),

(34, 'Porto', 'Portugal', 'Europe',
 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1170',
 'Porto, Portugal',
 'A charming riverside city famous for port wine, colorful tiles, and stunning bridges. Experience authentic Portuguese culture, beautiful architecture, and incredible value.',
 30,
 'Porto offers incredible value with stunning beauty, amazing food, and vibrant student culture. Perfect for budget-conscious students who love history and coastal charm.',
 ARRAY[
   'Extremely affordable accommodations and food',
   'Student discounts at port wine cellars',
   'Free walking tours along the Douro River',
   'Budget-friendly Portuguese cuisine',
   'Cheap public transport and metro passes'
 ]),

(35, 'Cork', 'Ireland', 'Europe',
 'https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?q=80&w=2274&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Cork, Ireland',
 'Ireland''s second city with vibrant food culture, friendly locals, and rich maritime history. Experience authentic Irish charm, lively pubs, and beautiful coastal scenery nearby.',
 40,
 'Cork offers warm Irish hospitality, vibrant student culture, and great value. Perfect for students who love friendly atmospheres, music, and coastal adventures.',
 ARRAY[
   'Student discounts at local attractions',
   'Affordable student accommodations near university',
   'Budget-friendly pub culture and traditional music',
   'Free walking tours and cultural events',
   'Student discounts on public transport'
 ]),

(36, 'Salzburg', 'Austria', 'Europe',
 'https://images.unsplash.com/photo-1603892710963-331039c8dc66?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Salzburg, Austria',
 'Mozart''s birthplace with stunning Alpine scenery, baroque architecture, and classical music heritage. Experience The Sound of Music locations and imperial grandeur.',
 45,
 'Salzburg offers incredible music culture, stunning mountain views, and charming old town. Perfect for students who love classical music, history, and Alpine beauty.',
 ARRAY[
   'Student discounts at Mozart museums and concerts',
   'Affordable student accommodations',
   'Budget-friendly Austrian cuisine',
   'Free walking tours of the old town',
   'Discounted cable car rides to fortress'
 ]),

(37, 'Aarhus', 'Denmark', 'Europe',
 'https://plus.unsplash.com/premium_photo-1734414813946-a105a02d1b7d?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Aarhus, Denmark',
 'Denmark''s second city with vibrant student culture, modern architecture, and beautiful coastal location. Experience innovative design, museums, and relaxed Scandinavian lifestyle.',
 45,
 'Aarhus offers vibrant student scene, beautiful design, and relaxed atmosphere. Perfect for students interested in architecture, culture, and Scandinavian living.',
 ARRAY[
   'Student discounts at museums and ARoS art museum',
   'Affordable student housing options',
   'Budget-friendly cafes and food markets',
   'Free cultural events and festivals',
   'Discounted public transport with student card'
 ]),

(38, 'Gothenburg', 'Sweden', 'Europe',
 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1170',
 'Gothenburg, Sweden',
 'Sweden''s second city with beautiful canals, vibrant music scene, and coastal charm. Experience innovative food culture, friendly atmosphere, and stunning archipelago.',
 50,
 'Gothenburg offers great student culture, beautiful scenery, and vibrant music scene. Perfect for students who love coastal cities, sustainability, and Swedish lifestyle.',
 ARRAY[
   'Student discounts at museums and attractions',
   'Affordable student accommodations',
   'Budget-friendly student lunch restaurants',
   'Free access to many cultural events',
   'Discounted public transport passes'
 ]),

(39, 'Bergen', 'Norway', 'Europe',
 'https://plus.unsplash.com/premium_photo-1694475250638-a006ac51161b?q=80&w=1289&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Bergen, Norway',
 'The gateway to the fjords with colorful Bryggen wharf, stunning natural beauty, and rich maritime history. Experience breathtaking landscapes and authentic Norwegian culture.',
 55,
 'Bergen offers incredible natural beauty, unique culture, and stunning fjord access. Perfect for adventurous students who love nature, hiking, and Nordic experiences.',
 ARRAY[
   'Student discounts at museums and funicular',
   'Affordable student accommodations',
   'Budget-friendly fish market and local food',
   'Free hiking trails and natural attractions',
   'Discounted public transport passes'
 ]),

(40, 'Tampere', 'Finland', 'Europe',
 'https://images.unsplash.com/photo-1636452089599-56a0dc26b4f2?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Tampere, Finland',
 'Finland''s industrial heart transformed into a vibrant cultural hub. Experience lakeside beauty, sauna culture, and innovative museums in this student-friendly city.',
 45,
 'Tampere offers vibrant student culture, beautiful lakes, and affordable living. Perfect for students interested in Finnish culture, technology, and outdoor activities.',
 ARRAY[
   'Student discounts at museums and attractions',
   'Very affordable student accommodations',
   'Budget-friendly student restaurants',
   'Free access to many cultural events',
   'Discounted public transport with student card'
 ]),
(41, 'Krakow', 'Poland', 'Europe',
 'https://plus.unsplash.com/premium_photo-1661962364008-85ad40328d89?q=80&w=2671&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Krakow, Poland',
 'Poland''s cultural capital with stunning medieval architecture, rich history, and vibrant student life. Experience beautiful old town, fascinating museums, and incredible value.',
 25,
 'Krakow offers incredible history, beautiful architecture, and amazing value. Perfect for budget-conscious students who love culture, history, and vibrant nightlife.',
 ARRAY[
   'Extremely affordable accommodations and food',
   'Student discounts at museums and historical sites',
   'Free walking tours of the old town',
   'Budget-friendly Polish cuisine and pierogi',
   'Very cheap public transport'
 ]),

(42, 'Debrecen', 'Hungary', 'Europe',
 'https://plus.unsplash.com/premium_photo-1690921288020-1556d0868ff5?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Debrecen, Hungary',
 'Hungary''s second city with beautiful baroque architecture, thermal baths, and strong university tradition. Experience authentic Hungarian culture away from tourist crowds.',
 25,
 'Debrecen offers incredible value with authentic culture, thermal baths, and vibrant student community. Perfect for budget students seeking genuine Hungarian experiences.',
 ARRAY[
   'Extremely affordable accommodations',
   'Student discounts at thermal baths',
   'Very cheap Hungarian food and markets',
   'Free cultural events and festivals',
   'Budget-friendly public transport'
 ]),

(43, 'Thessaloniki', 'Greece', 'Europe',
 'https://images.unsplash.com/photo-1641758140558-ee487bb94c0e?q=80&w=2274&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Thessaloniki, Greece',
 'Greece''s cultural capital with vibrant waterfront, Byzantine history, and incredible food scene. Experience authentic Greek culture, beautiful sunsets, and lively student atmosphere.',
 30,
 'Thessaloniki offers amazing food, rich history, and vibrant student culture at great prices. Perfect for students who love Greek culture, beaches, and Mediterranean lifestyle.',
 ARRAY[
   'Very affordable accommodations and food',
   'Student discounts at museums and sites',
   'Budget-friendly Greek tavernas',
   'Free beach access and waterfront walks',
   'Cheap public transport'
 ]),

(44, 'Split', 'Croatia', 'Europe',
 'https://images.unsplash.com/photo-1555990538-c48ab0a194b5?q=80&w=2671&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Split, Croatia',
 'Croatia''s coastal gem with Roman palace at its heart, stunning beaches, and vibrant nightlife. Experience ancient history meeting Mediterranean beach culture.',
 35,
 'Split offers perfect mix of history, beaches, and nightlife at affordable prices. Perfect for students who love coastal cities, ancient ruins, and island-hopping adventures.',
 ARRAY[
   'Affordable beachside accommodations',
   'Student discounts at Diocletian''s Palace',
   'Budget-friendly seafood and konoba restaurants',
   'Free beach access everywhere',
   'Cheap ferry connections to islands'
 ]),

(45, 'Dubrovnik', 'Croatia', 'Europe',
 'https://images.unsplash.com/photo-1414862625453-d87604a607e4?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Dubrovnik, Croatia',
 'The Pearl of the Adriatic with stunning medieval walls, crystal-clear waters, and Game of Thrones fame. Experience breathtaking beauty and rich maritime history.',
 45,
 'Dubrovnik offers stunning beauty and fascinating history. Perfect for students who love medieval architecture, clear seas, and iconic filming locations.',
 ARRAY[
   'Student discounts on city wall entrance',
   'Affordable hostels outside old town',
   'Budget-friendly local restaurants',
   'Free beach access at Banje and Lapad',
   'Cheap bus connections along coast'
 ]),

(46, 'Florence', 'Italy', 'Europe',
 'https://plus.unsplash.com/premium_photo-1676288635850-cd91d5b2a3af?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Florence, Italy',
 'The cradle of the Renaissance with world-class art, stunning architecture, and incredible food. Experience Michelangelo, da Vinci, and authentic Tuscan culture.',
 45,
 'Florence offers unparalleled art and history with beautiful architecture and amazing food. Perfect for art lovers, history students, and food enthusiasts.',
 ARRAY[
   'Student discounts at Uffizi and major museums',
   'Affordable trattorias and gelaterias',
   'Free entry to many churches and piazzas',
   'Budget-friendly student accommodations',
   'Cheap regional train connections'
 ]),

(47, 'Venice', 'Italy', 'Europe',
 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1183',
 'Venice, Italy',
 'The floating city with romantic canals, stunning architecture, and unique atmosphere. Experience gondolas, historic palaces, and one-of-a-kind Italian charm.',
 50,
 'Venice offers a truly unique experience with its canals and historic beauty. Perfect for students who want to experience something completely different.',
 ARRAY[
   'Student discounts at museums and attractions',
   'Affordable bacari (wine bars) with cicchetti',
   'Free walking tours of hidden neighborhoods',
   'Budget accommodations on mainland Mestre',
   'Student discounts on vaporetto passes'
 ]),

(48, 'Milan', 'Italy', 'Europe',
 'https://images.unsplash.com/photo-1594755260889-29d5fb8e2d1f?q=80&w=1335&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Milan, Italy',
 'Italy''s fashion capital with stunning Duomo, world-class shopping, and innovative culture. Experience modern design, Leonardo da Vinci''s works, and aperitivo culture.',
 50,
 'Milan offers fashion, design, and culture with modern Italian flair. Perfect for students interested in fashion, design, and contemporary culture.',
 ARRAY[
   'Student discounts at museums and La Scala',
   'Affordable aperitivo deals with buffets',
   'Free entry to Duomo piazza',
   'Budget-friendly student accommodations',
   'Cheap metro and tram passes'
 ]),

(49, 'Birmingham', 'United Kingdom', 'Europe',
 'https://images.unsplash.com/photo-1499958060387-dbdb8d0994fb?q=80&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Birmingham, United Kingdom',
 'UK''s second city with diverse culture, vibrant arts scene, and incredible food diversity. Experience multicultural atmosphere, modern regeneration, and industrial heritage.',
 45,
 'Birmingham offers incredible diversity, vibrant student culture, and great value. Perfect for students who love multicultural cities and authentic British experiences.',
 ARRAY[
   'Student discounts at museums and attractions',
   'Affordable student accommodations',
   'Budget-friendly international food scene',
   'Free cultural events and festivals',
   'Student discounts on public transport'
 ]),

(50, 'Liverpool', 'United Kingdom', 'Europe',
 'https://images.unsplash.com/photo-1726410238762-2388af04eadb?q=80&w=2743&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Liverpool, United Kingdom',
 'The Beatles'' hometown with rich maritime history, vibrant music scene, and friendly locals. Experience world-class museums, waterfront regeneration, and legendary football culture.',
 40,
 'Liverpool offers incredible music heritage, vibrant culture, and great value. Perfect for students who love music, history, and authentic Scouse hospitality.',
 ARRAY[
   'Free entry to many museums and galleries',
   'Student discounts at Beatles attractions',
   'Affordable student accommodations',
   'Budget-friendly pubs and food markets',
   'Student discounts on public transport'
 ]),

(51, 'Chiang Mai', 'Thailand', 'Asia',
 'https://images.unsplash.com/photo-1599576838688-8a6c11263108?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Chiang Mai, Thailand',
 'Northern Thailand''s cultural heart with stunning temples, night markets, and surrounding mountains. Experience authentic Thai culture, digital nomad scene, and incredible food.',
 20,
 'Chiang Mai offers incredible value with rich culture, beautiful temples, and relaxed atmosphere. Perfect for budget students who love authentic experiences and nature.',
 ARRAY[
   'Extremely affordable accommodations and food',
   'Very cheap street food and night markets',
   'Budget-friendly temple visits',
   'Affordable cooking classes and tours',
   'Cheap scooter rentals and local transport'
 ]),

(52, 'Da Nang', 'Vietnam', 'Asia',
 'https://images.unsplash.com/photo-1505018620898-92616e1849cc?q=80&w=2676&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Da Nang, Vietnam',
 'Vietnam''s coastal gem with stunning beaches, dramatic mountains, and vibrant food scene. Experience beautiful bridges, nearby Hoi An, and amazing seafood.',
 20,
 'Da Nang offers incredible beaches, amazing food, and great value. Perfect for students who love coastal cities, Vietnamese culture, and adventure.',
 ARRAY[
   'Extremely affordable beachfront accommodations',
   'Very cheap and delicious Vietnamese food',
   'Free beach access everywhere',
   'Budget-friendly tours to Marble Mountains',
   'Cheap motorbike rentals'
 ]),

(53, 'Hanoi', 'Vietnam', 'Asia',
 'https://images.unsplash.com/photo-1599708153386-62bf3f035c78?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Hanoi, Vietnam',
 'Vietnam''s capital with charming old quarter, rich history, and incredible street food culture. Experience French colonial architecture, vibrant markets, and authentic Vietnamese life.',
 20,
 'Hanoi offers incredible culture, amazing street food, and unbeatable prices. Perfect for budget students who love authentic Asian experiences and food adventures.',
 ARRAY[
   'Extremely affordable accommodations',
   'Incredibly cheap street food everywhere',
   'Free walking tours of old quarter',
   'Budget-friendly coffee culture',
   'Very cheap local transport and motorbikes'
 ]),

(54, 'Penang', 'Malaysia', 'Asia',
 'https://images.unsplash.com/photo-1620488212381-dea91f7dd69a?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Penang, Malaysia',
 'Malaysia''s food capital with UNESCO heritage town, street art, and incredible hawker centers. Experience diverse culture, beautiful beaches, and unbeatable cuisine.',
 25,
 'Penang offers world-class food, rich culture, and amazing value. Perfect for students who love diverse cuisine, street art, and multicultural experiences.',
 ARRAY[
   'Very affordable accommodations and hostels',
   'Incredibly cheap hawker center food',
   'Free street art tours in Georgetown',
   'Budget-friendly cultural attractions',
   'Cheap local buses and ferries'
 ]),

(55, 'Jakarta', 'Indonesia', 'Asia',
 'https://plus.unsplash.com/premium_photo-1733306526358-ccebc598f0a2?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Jakarta, Indonesia',
 'Indonesia''s bustling capital with modern skyline, diverse culture, and incredible food scene. Experience dynamic city life, shopping, and authentic Indonesian culture.',
 25,
 'Jakarta offers vibrant culture, amazing food, and great value. Perfect for students who love big cities, diverse experiences, and Southeast Asian energy.',
 ARRAY[
   'Very affordable accommodations',
   'Extremely cheap street food and warungs',
   'Budget-friendly shopping malls',
   'Student discounts at attractions',
   'Cheap public transport and ride-sharing'
 ]),

(56, 'Cebu', 'Philippines', 'Asia',
 'https://images.unsplash.com/photo-1581521894817-f7cb8bedd905?q=80&w=3134&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Cebu, Philippines',
 'The Queen City of the South with beautiful beaches, rich history, and friendly locals. Experience island-hopping, diving, and authentic Filipino hospitality.',
 20,
 'Cebu offers stunning beaches, amazing value, and warm hospitality. Perfect for students who love tropical islands, diving, and budget adventures.',
 ARRAY[
   'Extremely affordable accommodations',
   'Very cheap local food and markets',
   'Budget-friendly island-hopping tours',
   'Affordable diving and snorkeling',
   'Cheap local transport and jeepneys'
 ]),

(57, 'Pokhara', 'Nepal', 'Asia',
 'https://images.unsplash.com/photo-1610997686651-98492fd08108?q=80&w=3131&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Pokhara, Nepal',
 'Nepal''s adventure capital with stunning Himalayan views, beautiful lakes, and trekking opportunities. Experience paragliding, boating, and mountain culture.',
 15,
 'Pokhara offers incredible mountain scenery, adventure activities, and amazing prices. Perfect for adventurous students who love trekking and natural beauty.',
 ARRAY[
   'Extremely affordable accommodations',
   'Very cheap local food and dal bhat',
   'Budget-friendly trekking permits',
   'Affordable adventure activities',
   'Cheap local transport and boats'
 ]),

(58, 'Kandy', 'Sri Lanka', 'Asia',
 'https://images.unsplash.com/photo-1708694648935-eeafaa7fd1ef?q=80&w=1335&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Kandy, Sri Lanka',
 'Sri Lanka''s cultural capital with sacred Temple of the Tooth, lush hills, and tea plantations. Experience traditional dance, botanical gardens, and authentic culture.',
 20,
 'Kandy offers rich culture, beautiful scenery, and incredible value. Perfect for students interested in Buddhism, nature, and authentic Sri Lankan experiences.',
 ARRAY[
   'Very affordable accommodations',
   'Cheap local food and tea shops',
   'Student discounts at cultural sites',
   'Free botanical garden walks',
   'Budget-friendly tuk-tuks and buses'
 ]),

(59, 'Tashkent', 'Uzbekistan', 'Asia',
 'https://images.unsplash.com/photo-1622021109028-8ba1d5374161?q=80&w=2226&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Tashkent, Uzbekistan',
 'Central Asia''s modern capital with stunning Soviet architecture, ancient history, and Silk Road heritage. Experience unique culture, beautiful metro, and incredible hospitality.',
 25,
 'Tashkent offers unique Central Asian culture, beautiful architecture, and amazing value. Perfect for students seeking off-the-beaten-path adventures.',
 ARRAY[
   'Very affordable accommodations',
   'Extremely cheap local food and plov',
   'Beautiful metro stations to explore',
   'Budget-friendly historical sites',
   'Cheap local transport'
 ]),

(60, 'Almaty', 'Kazakhstan', 'Asia',
 'https://images.unsplash.com/photo-1548450847-8a9a5cc3968f?q=80&w=2673&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Almaty, Kazakhstan',
 'Kazakhstan''s cultural capital with stunning mountain backdrop, Soviet architecture, and vibrant café culture. Experience unique blend of Asian and European influences.',
 30,
 'Almaty offers unique culture, beautiful mountain scenery, and great value. Perfect for adventurous students interested in Central Asian experiences.',
 ARRAY[
   'Affordable accommodations and hostels',
   'Cheap local food and markets',
   'Free hiking in nearby mountains',
   'Budget-friendly cable car rides',
   'Cheap public transport and metro'
 ]),

(61, 'Calgary', 'Canada', 'North America',
 'https://images.unsplash.com/photo-1526863336296-fac32d550655?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Calgary, Canada',
 'Gateway to the Canadian Rockies with modern skyline, cowboy culture, and outdoor adventures. Experience the famous Stampede, nearby mountain access, and friendly western hospitality.',
 45,
 'Calgary offers stunning mountain access, vibrant culture, and excellent quality of life. Perfect for students who love outdoor activities, winter sports, and Canadian lifestyle.',
 ARRAY[
   'Student discounts at attractions',
   'Affordable student accommodations',
   'Budget-friendly public transport',
   'Free outdoor activities and parks',
   'Student deals at Stampede events'
 ]),

(62, 'Ottawa', 'Canada', 'North America',
 'https://plus.unsplash.com/premium_photo-1697730030448-fbfa52261ab6?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Ottawa, Canada',
 'Canada''s beautiful capital with stunning Parliament, world-class museums, and Rideau Canal. Experience bilingual culture, historic architecture, and seasonal festivals.',
 45,
 'Ottawa offers rich history, beautiful architecture, and great student life. Perfect for students interested in politics, culture, and Canadian heritage.',
 ARRAY[
   'Free entry to many national museums',
   'Student discounts at major attractions',
   'Affordable student housing',
   'Budget-friendly public transport',
   'Free skating on Rideau Canal in winter'
 ]),

(63, 'Quebec City', 'Canada', 'North America',
 'https://images.unsplash.com/photo-1710881710078-d25d578fedc3?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Quebec City, Canada',
 'North America''s most European city with stunning old town, French culture, and winter magic. Experience cobblestone streets, Château Frontenac, and authentic Québécois culture.',
 40,
 'Quebec City offers European charm in North America with rich French culture. Perfect for students who love history, French language, and charming old towns.',
 ARRAY[
   'Student discounts at historical sites',
   'Affordable French bistros and cafes',
   'Budget-friendly student accommodations',
   'Free walking tours of old town',
   'Discounted public transport passes'
 ]),

(64, 'Guadalajara', 'Mexico', 'North America',
 'https://images.unsplash.com/photo-1565670105658-ea35d27f7de7?q=80&w=2225&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Guadalajara, Mexico',
 'Mexico''s cultural heart with mariachi, tequila, and stunning colonial architecture. Experience authentic Mexican culture, vibrant arts scene, and incredible food.',
 25,
 'Guadalajara offers authentic Mexican culture, amazing food, and great value. Perfect for students who love music, art, and genuine Mexican experiences.',
 ARRAY[
   'Very affordable accommodations and food',
   'Cheap street food and local markets',
   'Student discounts at museums',
   'Free cultural events and festivals',
   'Budget-friendly public transport'
 ]),

(65, 'Cancun', 'Mexico', 'North America',
 'https://images.unsplash.com/photo-1630252421399-ddde79af47b3?q=80&w=2274&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Cancun, Mexico',
 'Caribbean paradise with turquoise waters, white sand beaches, and vibrant nightlife. Experience Mayan ruins, cenotes, and all-inclusive beach resorts.',
 35,
 'Cancun offers stunning beaches, amazing nightlife, and student-friendly packages. Perfect for students wanting Caribbean paradise and spring break vibes.',
 ARRAY[
   'Affordable all-inclusive student packages',
   'Student discounts on tours and activities',
   'Budget-friendly local food away from hotel zone',
   'Free beach access everywhere',
   'Cheap buses to Mayan ruins'
 ]),

(66, 'Cusco', 'Peru', 'South America',
 'https://images.unsplash.com/photo-1593494441374-bad54249d0e8?q=80&w=2673&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Cusco, Peru',
 'Gateway to Machu Picchu with stunning Inca heritage, colonial architecture, and high-altitude beauty. Experience ancient history, vibrant markets, and Andean culture.',
 25,
 'Cusco offers incredible Inca history, stunning scenery, and amazing value. Perfect for students seeking adventure, history, and life-changing experiences.',
 ARRAY[
   'Very affordable hostels and accommodations',
   'Cheap local food and markets',
   'Student discounts on Machu Picchu permits',
   'Budget-friendly trekking tours',
   'Affordable local transport and buses'
 ]),

(67, 'Valparaiso', 'Chile', 'South America',
 'https://images.unsplash.com/photo-1566275163755-bbb09bbc5a13?q=80&w=2274&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Valparaiso, Chile',
 'Chile''s colorful port city with stunning street art, funiculars, and bohemian culture. Experience vibrant hills, artistic atmosphere, and Pacific Ocean views.',
 30,
 'Valparaiso offers incredible street art, unique culture, and great value. Perfect for students who love art, alternative culture, and coastal cities.',
 ARRAY[
   'Affordable accommodations in colorful hills',
   'Cheap local food and seafood',
   'Free street art tours everywhere',
   'Budget-friendly funicular rides',
   'Affordable buses to Santiago and beaches'
 ]),

(68, 'Barranquilla', 'Colombia', 'South America',
 'https://images.unsplash.com/photo-1587332064870-7ccfa02a94ad?q=80&w=2274&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Barranquilla, Colombia',
 'Colombia''s Caribbean gateway with vibrant carnival culture, beautiful beaches, and warm hospitality. Experience coastal lifestyle, festive atmosphere, and authentic Colombian culture.',
 25,
 'Barranquilla offers Caribbean vibes, incredible carnival, and amazing value. Perfect for students who love beaches, music, and vibrant Colombian culture.',
 ARRAY[
   'Very affordable accommodations',
   'Extremely cheap local food and arepas',
   'Free carnival events (February)',
   'Budget-friendly beaches nearby',
   'Cheap public transport'
 ]),

(69, 'Cartagena', 'Colombia', 'South America',
 'https://images.unsplash.com/photo-1583531352515-8884af319dc1?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Cartagena, Colombia',
 'Colombia''s Caribbean jewel with stunning colonial old town, beautiful beaches, and vibrant nightlife. Experience colorful architecture, island hopping, and romantic atmosphere.',
 30,
 'Cartagena offers stunning colonial beauty, Caribbean beaches, and great value. Perfect for students seeking romantic settings, history, and beach life.',
 ARRAY[
   'Affordable hostels in Getsemani',
   'Cheap street food and local restaurants',
   'Student discounts at historical sites',
   'Free walking tours of old town',
   'Budget-friendly island day trips'
 ]),

(70, 'Cali', 'Colombia', 'South America',
 'https://images.unsplash.com/photo-1728588519059-a62e06050425?q=80&w=2262&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Cali, Colombia',
 'The world capital of salsa with incredible dance culture, warm weather, and vibrant nightlife. Experience authentic Colombian rhythm, friendly locals, and energetic atmosphere.',
 25,
 'Cali offers incredible salsa culture, warm hospitality, and amazing prices. Perfect for students who love dancing, music, and authentic Colombian experiences.',
 ARRAY[
   'Very affordable accommodations',
   'Extremely cheap salsa classes',
   'Budget-friendly local food',
   'Free salsa in parks and plazas',
   'Cheap public transport and taxis'
 ]),
(71, 'Quito', 'Ecuador', 'South America',
 'https://images.unsplash.com/photo-1610226977124-9fd2755d09f2?q=80&w=2274&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Quito, Ecuador',
 'The world''s highest capital with stunning colonial center, surrounding volcanoes, and gateway to Galapagos. Experience UNESCO heritage, equator line, and Andean culture.',
 25,
 'Quito offers incredible colonial architecture, stunning mountain views, and amazing value. Perfect for students seeking adventure, history, and access to Galapagos.',
 ARRAY[
   'Very affordable accommodations and hostels',
   'Cheap local food and markets',
   'Student discounts at museums',
   'Free walking tours of colonial center',
   'Budget-friendly day trips to volcanoes'
 ]),

(72, 'Montevideo', 'Uruguay', 'South America',
 'https://plus.unsplash.com/premium_photo-1742457604656-b9feed9543f1?q=80&w=2290&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Montevideo, Uruguay',
 'Uruguay''s relaxed capital with beautiful beaches, vibrant culture, and European charm. Experience tango, mate culture, and one of South America''s safest cities.',
 35,
 'Montevideo offers relaxed lifestyle, safe environment, and unique Uruguayan culture. Perfect for students seeking safety, beaches, and authentic South American experiences.',
 ARRAY[
   'Affordable accommodations and hostels',
   'Reasonable local food and parrillas',
   'Free beach access along the rambla',
   'Student discounts at cultural sites',
   'Affordable public transport'
 ]),

(73, 'La Paz', 'Bolivia', 'South America',
 'https://images.unsplash.com/photo-1544142447-e43d0fe04bf2?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'La Paz, Bolivia',
 'The world''s highest administrative capital with stunning mountain views, cable cars, and indigenous culture. Experience dramatic landscapes, witches'' market, and Death Road.',
 20,
 'La Paz offers incredible mountain scenery, unique culture, and unbeatable prices. Perfect for adventurous students who love high-altitude adventures and authentic experiences.',
 ARRAY[
   'Extremely affordable accommodations',
   'Very cheap local food and street markets',
   'Budget-friendly cable car system',
   'Affordable Death Road biking tours',
   'Cheap local transport'
 ]),

(74, 'Asunción', 'Paraguay', 'South America',
 'https://images.unsplash.com/photo-1655425541685-c3d9b0672d9f?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Asunción, Paraguay',
 'Paraguay''s riverside capital with colonial charm, warm hospitality, and incredibly affordable prices. Experience authentic culture away from tourist trails.',
 20,
 'Asunción offers incredible value, authentic culture, and warm hospitality. Perfect for budget students seeking off-the-beaten-path South American adventures.',
 ARRAY[
   'Extremely affordable accommodations',
   'Very cheap local food and chipa',
   'Budget-friendly cultural attractions',
   'Free riverfront walks and parks',
   'Cheap public transport and taxis'
 ]),

(75, 'San Juan', 'Puerto Rico', 'North America',
 'https://images.unsplash.com/photo-1625642471723-12744e6e4211?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'San Juan, Puerto Rico',
 'Caribbean paradise with stunning colonial old town, beautiful beaches, and vibrant culture. Experience colorful architecture, bioluminescent bays, and tropical beauty.',
 40,
 'San Juan offers Caribbean beauty, rich history, and US accessibility. Perfect for students seeking tropical paradise with colonial charm and beach life.',
 ARRAY[
   'Affordable beachside accommodations',
   'Student-friendly food trucks and local spots',
   'Free beach access everywhere',
   'Budget-friendly walking tours of Old San Juan',
   'Affordable public buses and ferries'
 ]),

(76, 'Trinidad', 'Cuba', 'North America',
 'https://images.unsplash.com/photo-1621458425208-b65bc41f82ae?q=80&w=3131&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Trinidad, Cuba',
 'Cuba''s colonial gem with colorful streets, stunning architecture, and nearby beaches. Experience preserved Spanish colonial heritage, tobacco farms, and authentic Cuban life.',
 25,
 'Trinidad offers perfectly preserved colonial beauty, authentic culture, and great value. Perfect for students who love history, architecture, and Cuban charm.',
 ARRAY[
   'Very affordable casa particulares',
   'Cheap local food and paladares',
   'Budget-friendly beach access nearby',
   'Affordable salsa lessons and live music',
   'Cheap horse rides to waterfalls'
 ]),

(77, 'Mombasa', 'Kenya', 'Africa',
 'https://plus.unsplash.com/premium_photo-1697729911993-626a3e2c44eb?q=80&w=3133&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Mombasa, Kenya',
 'Kenya''s coastal paradise with white sand beaches, rich Swahili culture, and historic old town. Experience beautiful coral reefs, spice markets, and tropical island getaways.',
 30,
 'Mombasa offers stunning beaches, rich culture, and great value. Perfect for students who love coastal life, snorkeling, and East African experiences.',
 ARRAY[
   'Affordable beachside accommodations',
   'Cheap local food and seafood',
   'Budget-friendly snorkeling and diving',
   'Free beach access and old town walks',
   'Affordable matatus and tuk-tuks'
 ]),

(78, 'Dar es Salaam', 'Tanzania', 'Africa',
 'https://images.unsplash.com/photo-1589177900326-900782f88a55?q=80&w=2673&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Dar es Salaam, Tanzania',
 'Tanzania''s vibrant coastal city with beautiful beaches, rich culture, and gateway to Zanzibar. Experience Swahili culture, bustling markets, and Indian Ocean beauty.',
 25,
 'Dar es Salaam offers coastal beauty, vibrant culture, and amazing value. Perfect for students seeking East African experiences and island access.',
 ARRAY[
   'Very affordable accommodations',
   'Cheap local food and street vendors',
   'Budget-friendly ferry to Zanzibar',
   'Free beach access and fish markets',
   'Affordable daladalas (local buses)'
 ]),

(79, 'Alexandria', 'Egypt', 'Africa',
 'https://images.unsplash.com/photo-1697546889969-27f7b5be8664?q=80&w=2274&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Alexandria, Egypt',
 'Egypt''s Mediterranean jewel with ancient history, beautiful corniche, and diverse culture. Experience historic library, Greek heritage, and coastal Egyptian lifestyle.',
 25,
 'Alexandria offers Mediterranean charm, rich history, and great value. Perfect for students fascinated by ancient civilizations and coastal Egyptian culture.',
 ARRAY[
   'Very affordable accommodations',
   'Cheap local food and seafood',
   'Student discounts at historical sites',
   'Free corniche walks and beach access',
   'Budget-friendly public transport'
 ]),

(80, 'Luxor', 'Egypt', 'Africa',
 'https://plus.unsplash.com/premium_photo-1661963854938-e69a4e65c1e3?q=80&w=3174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Luxor, Egypt',
 'The world''s greatest open-air museum with Valley of the Kings, Karnak Temple, and ancient wonders. Experience unparalleled pharaonic history and Nile River beauty.',
 20,
 'Luxor offers incredible ancient history, stunning temples, and amazing value. Perfect for students passionate about archaeology, Egyptology, and ancient civilizations.',
 ARRAY[
   'Very affordable accommodations and hostels',
   'Cheap local food and markets',
   'Student discounts at all archaeological sites',
   'Budget-friendly felucca rides on the Nile',
   'Affordable bicycle rentals and taxis'
 ]),
(81, 'Casablanca', 'Morocco', 'Africa',
 'https://images.unsplash.com/photo-1579017461826-8ea20d5cdb28?q=80&w=3956&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Casablanca, Morocco',
 'Morocco''s modern economic hub with stunning Hassan II Mosque, vibrant medina, and Atlantic coastline. Experience contemporary Moroccan life, art deco architecture, and coastal charm.',
 30,
 'Casablanca offers modern Moroccan culture, beautiful architecture, and great value. Perfect for students seeking urban Moroccan experiences and coastal beauty.',
 ARRAY[
   'Affordable accommodations and riads',
   'Cheap local food and seafood',
   'Student discounts at Hassan II Mosque',
   'Free corniche walks and beach access',
   'Budget-friendly trams and buses'
 ]),

(82, 'Lagos', 'Nigeria', 'Africa',
 'https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Lagos, Nigeria',
 'West Africa''s vibrant megacity with dynamic energy, incredible music scene, and rich culture. Experience Afrobeats capital, beautiful beaches, and entrepreneurial spirit.',
 30,
 'Lagos offers incredible energy, amazing music culture, and authentic West African experiences. Perfect for adventurous students who love music, culture, and urban energy.',
 ARRAY[
   'Affordable accommodations in safe areas',
   'Cheap local food and street vendors',
   'Budget-friendly live music venues',
   'Free beach access at Elegushi and Tarkwa Bay',
   'Affordable ride-sharing and danfo buses'
 ]),

(83, 'Kumasi', 'Ghana', 'Africa',
 'https://plus.unsplash.com/premium_photo-1733263204644-030811b45b22?q=80&w=2274&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Kumasi, Ghana',
 'The heart of Ashanti culture with rich history, vibrant markets, and warm hospitality. Experience traditional kente weaving, royal palaces, and authentic Ghanaian life.',
 25,
 'Kumasi offers rich Ashanti culture, warm hospitality, and great value. Perfect for students interested in African history, traditional crafts, and authentic experiences.',
 ARRAY[
   'Very affordable accommodations',
   'Cheap local food and street markets',
   'Student discounts at cultural sites',
   'Free visits to craft villages',
   'Budget-friendly tro-tros and taxis'
 ]),

(84, 'Addis Ababa', 'Ethiopia', 'Africa',
 'https://plus.unsplash.com/premium_photo-1697729902269-70f031f22531?q=80&w=2671&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Addis Ababa, Ethiopia',
 'Ethiopia''s high-altitude capital with rich history, coffee culture, and unique cuisine. Experience the birthplace of coffee, ancient churches, and vibrant Ethiopian culture.',
 25,
 'Addis Ababa offers unique Ethiopian culture, incredible coffee, and great value. Perfect for students seeking authentic East African experiences and ancient history.',
 ARRAY[
   'Very affordable accommodations',
   'Extremely cheap and delicious Ethiopian food',
   'Student discounts at museums',
   'Free coffee ceremonies and cultural events',
   'Budget-friendly minibuses and taxis'
 ]),

(85, 'Entebbe', 'Uganda', 'Africa',
 'https://images.unsplash.com/photo-1680200023508-5289ae3de157?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Entebbe, Uganda',
 'Uganda''s gateway on Lake Victoria with beautiful botanical gardens, wildlife sanctuaries, and relaxed atmosphere. Experience lakeside beauty and access to gorilla trekking.',
 25,
 'Entebbe offers beautiful lakeside setting, wildlife access, and great value. Perfect for students seeking East African nature, wildlife experiences, and relaxed vibes.',
 ARRAY[
   'Affordable lakeside accommodations',
   'Cheap local food and markets',
   'Budget-friendly wildlife sanctuaries',
   'Free botanical gardens and beach access',
   'Affordable boda-bodas and matatus'
 ]),

(86, 'Kigali', 'Rwanda', 'Africa',
 'https://images.unsplash.com/photo-1687986261123-b17f08f2796c?q=80&w=3131&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Kigali, Rwanda',
 'Africa''s cleanest capital with stunning hills, powerful memorials, and inspiring transformation. Experience safety, innovation, and beautiful mountain scenery.',
 30,
 'Kigali offers safety, cleanliness, and inspiring culture. Perfect for students interested in African development, genocide history, and gorilla trekking access.',
 ARRAY[
   'Affordable accommodations and hostels',
   'Reasonable local food and cafes',
   'Student discounts at memorials',
   'Free city walks on clean, safe streets',
   'Affordable moto-taxis and buses'
 ]),

-- ===================================================================
-- BATCH 7: Extra European Cities (IDs 135-144)
-- ===================================================================

(135, 'Edinburgh', 'United Kingdom', 'Europe',
 'https://plus.unsplash.com/premium_photo-1699566448247-1627bee256d0?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Edinburgh, United Kingdom',
 'Scotland''s stunning capital with medieval old town, iconic castle, and vibrant festival culture. Experience dramatic architecture, rich history, and world-class cultural scene.',
 45,
 'Edinburgh offers incredible history, stunning architecture, and vibrant festivals. Perfect for students who love culture, history, and Scottish charm.',
 ARRAY[
   'Free entry to many museums',
   'Student discounts at attractions and castle',
   'Affordable student accommodations',
   'Budget-friendly pubs and food markets',
   'Student discounts on buses and trams'
 ]),

(136, 'Manchester', 'United Kingdom', 'Europe',
 'https://images.unsplash.com/photo-1724135869739-6055627ba5df?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Manchester, United Kingdom',
 'England''s northern powerhouse with legendary music scene, football culture, and industrial heritage. Experience vibrant nightlife, diverse culture, and strong student community.',
 40,
 'Manchester offers incredible music heritage, vibrant student life, and great value. Perfect for students who love music, football, and urban culture.',
 ARRAY[
   'Free entry to many museums and galleries',
   'Student discounts at music venues',
   'Affordable student accommodations',
   'Budget-friendly Northern Quarter food scene',
   'Student tram and bus passes'
 ]),

(137, 'Bristol', 'United Kingdom', 'Europe',
 'https://plus.unsplash.com/premium_photo-1742457733585-9f82e246d74f?q=80&w=2274&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Bristol, United Kingdom',
 'A creative harbor city with Banksy street art, vibrant music scene, and maritime history. Experience innovative culture, beautiful suspension bridge, and eco-conscious lifestyle.',
 42,
 'Bristol offers creative culture, beautiful scenery, and vibrant student life. Perfect for students interested in art, sustainability, and alternative culture.',
 ARRAY[
   'Free Banksy street art tours',
   'Student discounts at attractions',
   'Affordable student accommodations',
   'Budget-friendly independent cafes',
   'Student bus passes available'
 ]),

(138, 'Glasgow', 'United Kingdom', 'Europe',
 'https://images.unsplash.com/photo-1531152369337-1d0b0b9ef20d?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Glasgow, United Kingdom',
 'Scotland''s vibrant cultural capital with stunning architecture, legendary music scene, and friendly locals. Experience Victorian heritage, contemporary arts, and authentic Scottish warmth.',
 40,
 'Glasgow offers incredible culture, friendly atmosphere, and great value. Perfect for students who love music, art, and authentic Scottish experiences.',
 ARRAY[
   'Free entry to excellent museums',
   'Student discounts at cultural venues',
   'Very affordable student accommodations',
   'Budget-friendly pub culture',
   'Student subway and bus passes'
 ]),

(139, 'Munich', 'Germany', 'Europe',
 'https://images.unsplash.com/photo-1595867818082-083862f3d630?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Munich, Germany',
 'Bavaria''s capital with beautiful beer gardens, stunning architecture, and Alpine access. Experience Oktoberfest, world-class museums, and Bavarian culture.',
 50,
 'Munich offers beautiful architecture, incredible beer culture, and Alpine beauty. Perfect for students who love German culture, outdoor activities, and quality of life.',
 ARRAY[
   'Student discounts at museums and palaces',
   'Affordable beer gardens and markets',
   'Budget-friendly student accommodations',
   'Free walking tours and park access',
   'Student public transport passes'
 ]),

(140, 'Hamburg', 'Germany', 'Europe',
 'https://plus.unsplash.com/premium_photo-1733353207482-d85d35635a45?q=80&w=2671&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Hamburg, Germany',
 'Germany''s maritime capital with beautiful harbor, vibrant nightlife, and modern architecture. Experience Reeperbahn, stunning Elbphilharmonie, and cosmopolitan atmosphere.',
 45,
 'Hamburg offers maritime charm, vibrant culture, and excellent student life. Perfect for students who love modern cities, music, and northern German character.',
 ARRAY[
   'Student discounts at museums',
   'Affordable student accommodations',
   'Budget-friendly harbor food markets',
   'Free harbor walks and beach access',
   'Student public transport passes'
 ]),

(141, 'Frankfurt', 'Germany', 'Europe',
 'https://images.unsplash.com/photo-1626447637943-4c9d412fa8cf?q=80&w=2274&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Frankfurt, Germany',
 'Germany''s financial hub with modern skyline, historic Römerberg, and international atmosphere. Experience banking district, beautiful Main River, and diverse culture.',
 48,
 'Frankfurt offers modern German experience, international culture, and central location. Perfect for students interested in business, finance, and European travel hub.',
 ARRAY[
   'Student discounts at museums',
   'Affordable student housing options',
   'Budget-friendly apple wine taverns',
   'Free river walks and park access',
   'Excellent student transport passes'
 ]),

(142, 'Cologne', 'Germany', 'Europe',
 'https://images.unsplash.com/photo-1561624485-0e43bcc1836d?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Cologne, Germany',
 'Rhineland''s cultural heart with stunning cathedral, vibrant carnival, and legendary nightlife. Experience rich history, beer culture, and welcoming atmosphere.',
 42,
 'Cologne offers beautiful cathedral, vibrant culture, and great student scene. Perfect for students who love history, nightlife, and German beer culture.',
 ARRAY[
   'Student discounts at museums and cathedral',
   'Affordable Kölsch beer gardens',
   'Budget-friendly student accommodations',
   'Free carnival events (February)',
   'Student public transport passes'
 ]),

(143, 'Seville', 'Spain', 'Europe',
 'https://images.unsplash.com/photo-1688404808661-92f72f2ea258?q=80&w=2676&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Seville, Spain',
 'Andalusia''s passionate capital with stunning Moorish architecture, flamenco culture, and vibrant atmosphere. Experience beautiful plazas, tapas bars, and Spanish soul.',
 35,
 'Seville offers passionate Spanish culture, beautiful architecture, and amazing value. Perfect for students who love flamenco, tapas, and authentic Andalusian life.',
 ARRAY[
   'Student discounts at Alcázar and cathedral',
   'Very affordable tapas bars',
   'Budget-friendly student accommodations',
   'Free flamenco in parks and plazas',
   'Cheap bike rentals and buses'
 ]),

(144, 'Valencia', 'Spain', 'Europe',
 'https://images.unsplash.com/photo-1529437971227-3344caa48ce2?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Valencia, Spain',
 'Spain''s coastal gem with futuristic architecture, beautiful beaches, and paella birthplace. Experience City of Arts and Sciences, vibrant festivals, and Mediterranean lifestyle.',
 38,
 'Valencia offers perfect mix of beach, culture, and innovation at great prices. Perfect for students who love coastal cities, modern architecture, and Spanish food.',
 ARRAY[
   'Student discounts at City of Arts and Sciences',
   'Affordable beach accommodations',
   'Budget-friendly authentic paella',
   'Free beach access and bike paths',
   'Cheap metro and bus passes'
 ]),
(145, 'Granada', 'Spain', 'Europe',
 'https://images.unsplash.com/photo-1564740603199-5f56138c6679?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Granada, Spain',
 'Andalusian jewel with stunning Alhambra palace, Moorish heritage, and Sierra Nevada views. Experience magical Arabic architecture, tapas culture, and student atmosphere.',
 32,
 'Granada offers incredible Moorish history, free tapas culture, and mountain beauty. Perfect for students who love history, architecture, and budget-friendly Spanish experiences.',
 ARRAY[
   'Student discounts at Alhambra',
   'Free tapas with every drink',
   'Very affordable student accommodations',
   'Budget-friendly tea houses and Arab baths',
   'Cheap bus connections to beaches and mountains'
 ]),

(146, 'Marseille', 'France', 'Europe',
 'https://images.unsplash.com/photo-1566838217578-1903568a76d9?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Marseille, France',
 'France''s vibrant port city with Mediterranean beauty, diverse culture, and incredible seafood. Experience stunning calanques, historic Vieux Port, and multicultural atmosphere.',
 40,
 'Marseille offers Mediterranean charm, diverse culture, and great value for France. Perfect for students who love coastal cities, seafood, and authentic French experiences.',
 ARRAY[
   'Student discounts at museums',
   'Affordable bouillabaisse and seafood',
   'Budget-friendly student accommodations',
   'Free calanques hiking',
   'Cheap metro and bus passes'
 ]),

(147, 'Toulouse', 'France', 'Europe',
 'https://images.unsplash.com/photo-1533375954403-dcc42d37d33a?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Toulouse, France',
 'The Pink City with aerospace industry, vibrant student culture, and beautiful architecture. Experience Canal du Midi, space museums, and southern French charm.',
 40,
 'Toulouse offers vibrant student culture, beautiful pink architecture, and great value. Perfect for students interested in aerospace, engineering, and French culture.',
 ARRAY[
   'Student discounts at Space Museum',
   'Affordable student restaurants',
   'Budget-friendly accommodations',
   'Free canal walks and riverside parks',
   'Cheap metro and tram passes'
 ]),

(148, 'Strasbourg', 'France', 'Europe',
 'https://images.unsplash.com/photo-1598875793784-55488654fb0b?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Strasbourg, France',
 'European capital with stunning cathedral, charming canals, and Franco-German culture. Experience beautiful half-timbered houses, Christmas markets, and international institutions.',
 42,
 'Strasbourg offers unique Franco-German blend, beautiful architecture, and European politics. Perfect for students interested in European affairs and charming cities.',
 ARRAY[
   'Student discounts at European institutions',
   'Affordable Alsatian restaurants',
   'Budget-friendly student accommodations',
   'Free walking tours of Petite France',
   'Student tram passes'
 ]),

(149, 'Naples', 'Italy', 'Europe',
 'https://images.unsplash.com/photo-1609244283184-96db6d696573?q=80&w=3140&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Naples, Italy',
 'Birthplace of pizza with stunning bay, volcanic scenery, and chaotic charm. Experience authentic Italian culture, archaeological wonders, and incredible street food.',
 35,
 'Naples offers authentic Italian experience, best pizza in the world, and great value. Perfect for students who love real Italian culture, history, and food adventures.',
 ARRAY[
   'Student discounts at Pompeii and museums',
   'Extremely affordable authentic pizza',
   'Budget-friendly street food culture',
   'Free walking tours of historic center',
   'Cheap metro and funicular passes'
 ]),

(150, 'Bologna', 'Italy', 'Europe',
 'https://images.unsplash.com/photo-1635469019177-7264fc1e013c?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Bologna, Italy',
 'Italy''s food capital with medieval towers, porticoed streets, and oldest university. Experience incredible cuisine, vibrant student life, and beautiful architecture.',
 40,
 'Bologna offers best Italian food, vibrant student culture, and beautiful medieval charm. Perfect for food lovers and students seeking authentic Italian university experience.',
 ARRAY[
   'Student discounts at university museums',
   'Affordable traditional trattorias',
   'Budget-friendly student accommodations',
   'Free walking under historic porticos',
   'Cheap bus passes for students'
 ]),

(151, 'Turin', 'Italy', 'Europe',
 'https://images.unsplash.com/photo-1576749784069-59707271bf42?q=80&w=3134&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Turin, Italy',
 'Former Italian capital with elegant baroque architecture, chocolate culture, and Alpine views. Experience royal palaces, Egyptian museum, and aperitivo birthplace.',
 38,
 'Turin offers elegant Italian charm, incredible museums, and great food. Perfect for students who love history, chocolate, and underrated Italian cities.',
 ARRAY[
   'Student discounts at royal palaces',
   'Affordable aperitivo and chocolate',
   'Budget-friendly student accommodations',
   'Free walking tours of baroque center',
   'Cheap metro and tram passes'
 ]),

(152, 'Ghent', 'Belgium', 'Europe',
 'https://images.unsplash.com/photo-1589749551167-067f0efd2ddd?q=80&w=1335&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Ghent, Belgium',
 'Medieval gem with stunning canal architecture, vibrant student culture, and excellent beer. Experience beautiful guildhalls, modern art, and authentic Belgian atmosphere.',
 40,
 'Ghent offers medieval beauty, vibrant student life, and great Belgian culture. Perfect for students who love historic cities, beer, and authentic experiences.',
 ARRAY[
   'Student discounts at museums and castle',
   'Affordable Belgian beer and cafes',
   'Budget-friendly student accommodations',
   'Free walking tours of medieval center',
   'Bike-friendly city with cheap rentals'
 ]),

(153, 'Bruges', 'Belgium', 'Europe',
 'https://images.unsplash.com/photo-1571317084911-8899d61cc464?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Bruges, Belgium',
 'Fairy-tale medieval city with stunning canals, chocolate shops, and preserved architecture. Experience romantic cobblestone streets, belfry tower, and Belgian charm.',
 45,
 'Bruges offers stunning medieval beauty, incredible chocolate, and romantic atmosphere. Perfect for students who love fairy-tale settings and Belgian culture.',
 ARRAY[
   'Student discounts at museums and belfry',
   'Affordable Belgian waffles and fries',
   'Budget-friendly accommodations nearby',
   'Free walking tours of canals',
   'Bike rentals for exploring'
 ]),

(154, 'Geneva', 'Switzerland', 'Europe',
 'https://images.unsplash.com/photo-1667758682790-c58fa23dc76f?q=80&w=2687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Geneva, Switzerland',
 'International hub with stunning lake, UN headquarters, and Alpine beauty. Experience multicultural atmosphere, luxury watches, and world-class quality of life.',
 65,
 'Geneva offers international atmosphere, stunning scenery, and unique Swiss experiences. Perfect for students interested in international relations and quality living.',
 ARRAY[
   'Student discounts at museums and UN tours',
   'Affordable student cafeterias',
   'Budget accommodations outside center',
   'Free lake walks and jet d''eau views',
   'Student public transport passes'
 ]),
(155, 'Basel', 'Switzerland', 'Europe',
 'https://images.unsplash.com/photo-1623855528606-61fb4681d75f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Basel, Switzerland',
 'Cultural capital at the Swiss-German-French border with world-class art museums and Rhine River charm. Experience Art Basel, beautiful old town, and international atmosphere.',
 60,
 'Basel offers incredible art scene, beautiful Rhine setting, and unique tri-national location. Perfect for art students and those interested in Swiss culture.',
 ARRAY[
   'Student discounts at excellent museums',
   'Affordable student accommodations',
   'Budget student restaurants',
   'Free Rhine swimming in summer',
   'Student public transport passes'
 ]),

(156, 'Lucerne', 'Switzerland', 'Europe',
 'https://images.unsplash.com/photo-1518079521743-d5f88b127929?q=80&w=1598&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Lucerne, Switzerland',
 'Picture-perfect lakeside city with stunning mountain views, medieval bridges, and Alpine beauty. Experience Chapel Bridge, Mount Pilatus, and Swiss charm.',
 58,
 'Lucerne offers breathtaking Alpine scenery, beautiful old town, and quintessential Swiss experience. Perfect for students who love mountains and scenic beauty.',
 ARRAY[
   'Student discounts at mountain excursions',
   'Affordable student hostels',
   'Budget-friendly student meals',
   'Free lake walks and old town',
   'Student rail passes for mountain trips'
 ]),

(157, 'Coimbra', 'Portugal', 'Europe',
 'https://images.unsplash.com/photo-1635893312205-6abda7db17a0?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Coimbra, Portugal',
 'Portugal''s historic university city with stunning library, fado music, and student traditions. Experience one of Europe''s oldest universities and authentic Portuguese culture.',
 30,
 'Coimbra offers rich university heritage, beautiful architecture, and great value. Perfect for students who love academic atmosphere and Portuguese culture.',
 ARRAY[
   'Very affordable student accommodations',
   'Cheap traditional Portuguese food',
   'Student discounts at university sites',
   'Free fado performances in streets',
   'Budget-friendly public transport'
 ]),

(158, 'Faro', 'Portugal', 'Europe',
 'https://plus.unsplash.com/premium_photo-1697729561003-8569898dc30b?q=80&w=1634&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Faro, Portugal',
 'Gateway to the Algarve with beautiful beaches, historic old town, and Ria Formosa nature reserve. Experience stunning coastline, affordable paradise, and Portuguese charm.',
 32,
 'Faro offers incredible beaches, natural beauty, and amazing value. Perfect for students who love coastal life and want affordable European beach paradise.',
 ARRAY[
   'Very affordable beachside accommodations',
   'Cheap fresh seafood and Portuguese food',
   'Student discounts at attractions',
   'Free beach access on stunning islands',
   'Budget-friendly buses to beaches'
 ]),

(159, 'Galway', 'Ireland', 'Europe',
 'https://images.unsplash.com/photo-1585334644725-e0b49aa6cdce?q=80&w=2274&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Galway, Ireland',
 'Ireland''s cultural heart with vibrant arts scene, traditional music, and stunning coastal beauty. Experience colorful streets, friendly pubs, and Wild Atlantic Way.',
 40,
 'Galway offers authentic Irish culture, incredible music, and coastal beauty. Perfect for students who love traditional music, friendly atmosphere, and Irish charm.',
 ARRAY[
   'Student discounts at cultural venues',
   'Affordable traditional pubs with music',
   'Budget-friendly student accommodations',
   'Free walking tours and coastal walks',
   'Student bus passes'
 ]),

(160, 'Limerick', 'Ireland', 'Europe',
 'https://images.unsplash.com/photo-1660687446301-7788b4a6ebe7?q=80&w=2671&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Limerick, Ireland',
 'Shannon-side city with medieval castle, vibrant student culture, and rich rugby heritage. Experience authentic Irish life, historic sites, and friendly locals.',
 38,
 'Limerick offers authentic Irish experience, strong student culture, and great value. Perfect for students seeking genuine Irish life and affordable living.',
 ARRAY[
   'Student discounts at King John''s Castle',
   'Very affordable student accommodations',
   'Budget-friendly traditional pubs',
   'Free riverside walks and parks',
   'Student bus passes'
 ]),

(161, 'Odense', 'Denmark', 'Europe',
 'https://plus.unsplash.com/premium_photo-1733306453050-1deda33e5cec?q=80&w=2677&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Odense, Denmark',
 'Hans Christian Andersen''s birthplace with fairy-tale charm, bike culture, and cozy atmosphere. Experience Danish hygge, beautiful gardens, and student-friendly city.',
 42,
 'Odense offers Danish charm, bike-friendly culture, and affordable Danish living. Perfect for students who love cycling, fairy tales, and Scandinavian lifestyle.',
 ARRAY[
   'Student discounts at museums',
   'Affordable student accommodations',
   'Budget-friendly Danish cafes',
   'Free bike-friendly city exploration',
   'Student public transport passes'
 ]),

(162, 'Aalborg', 'Denmark', 'Europe',
 'https://images.unsplash.com/photo-1584699411820-47302a6c00c0?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Aalborg, Denmark',
 'Northern Denmark''s vibrant city with waterfront culture, student atmosphere, and modern design. Experience maritime heritage, carnival culture, and Danish innovation.',
 44,
 'Aalborg offers vibrant student life, beautiful waterfront, and authentic Danish experiences. Perfect for students seeking smaller Danish city with great culture.',
 ARRAY[
   'Student discounts at museums',
   'Affordable student housing',
   'Budget-friendly student cafes',
   'Free waterfront walks and parks',
   'Student public transport passes'
 ]),

(163, 'Trondheim', 'Norway', 'Europe',
 'https://images.unsplash.com/photo-1639687809372-fe6e87e05fe4?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Trondheim, Norway',
 'Norway''s historic capital with stunning Nidaros Cathedral, fjord beauty, and strong student culture. Experience Viking heritage, colorful wharf houses, and northern lights.',
 52,
 'Trondheim offers rich history, beautiful fjords, and vibrant student community. Perfect for students who love Norwegian culture, nature, and academic atmosphere.',
 ARRAY[
   'Student discounts at museums and cathedral',
   'Affordable student accommodations',
   'Budget student cafeterias',
   'Free hiking and nature access',
   'Student public transport passes'
 ]),

(164, 'Stavanger', 'Norway', 'Europe',
 'https://images.unsplash.com/photo-1456018660448-98385e9fd51f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Stavanger, Norway',
 'Gateway to stunning fjords with charming old town, oil industry heritage, and outdoor adventures. Experience Pulpit Rock, white wooden houses, and Norwegian coastal life.',
 54,
 'Stavanger offers incredible fjord access, beautiful old town, and adventure opportunities. Perfect for students who love hiking, nature, and Norwegian experiences.',
 ARRAY[
   'Student discounts at museums',
   'Affordable student housing options',
   'Budget student meals',
   'Free hiking access to Pulpit Rock',
   'Student ferry and bus passes'
 ]),
(165, 'Oulu', 'Finland', 'Europe',
 'https://images.unsplash.com/photo-1657123096362-f12bfb5dcf53?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Oulu, Finland',
 'Northern Finland''s tech hub with beautiful archipelago, winter activities, and innovative culture. Experience midnight sun, northern lights, and modern Finnish lifestyle.',
 46,
 'Oulu offers unique northern experiences, tech innovation, and beautiful nature. Perfect for students interested in technology, Arctic experiences, and Finnish culture.',
 ARRAY[
   'Student discounts at museums and activities',
   'Affordable student accommodations',
   'Budget-friendly student restaurants',
   'Free outdoor activities and parks',
   'Student public transport passes'
 ]),

(166, 'Rovaniemi', 'Finland', 'Europe',
 'https://images.unsplash.com/photo-1645020456013-c4e693da0bbf?q=80&w=2673&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Rovaniemi, Finland',
 'Official hometown of Santa Claus with Arctic Circle location, northern lights, and winter magic. Experience authentic Lapland, reindeer, and midnight sun.',
 48,
 'Rovaniemi offers magical Arctic experiences, northern lights, and unique Finnish culture. Perfect for adventurous students seeking winter wonderland and Santa Claus village.',
 ARRAY[
   'Student discounts at Santa Claus attractions',
   'Affordable student hostels',
   'Budget-friendly Finnish food',
   'Free northern lights viewing',
   'Student discounts on Arctic activities'
 ]),

(167, 'Gdansk', 'Poland', 'Europe',
 'https://images.unsplash.com/photo-1623130622557-8fab31968b8f?q=80&w=2671&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Gdansk, Poland',
 'Beautiful Baltic port with colorful architecture, rich history, and beach access. Experience amber capital, maritime heritage, and vibrant student culture.',
 28,
 'Gdansk offers stunning architecture, rich history, and amazing value. Perfect for students who love coastal cities, history, and affordable European travel.',
 ARRAY[
   'Extremely affordable accommodations',
   'Cheap Polish food and pierogi',
   'Student discounts at historical sites',
   'Free beach access at Sopot',
   'Budget-friendly public transport'
 ]),

(168, 'Wroclaw', 'Poland', 'Europe',
 'https://images.unsplash.com/photo-1626826023333-bb7df9facc2b?q=80&w=2274&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Wroclaw, Poland',
 'City of islands and bridges with beautiful market square, gnome statues, and vibrant culture. Experience stunning architecture, student atmosphere, and amazing value.',
 27,
 'Wroclaw offers beautiful architecture, quirky gnome hunting, and great student life. Perfect for students seeking affordable European culture and unique experiences.',
 ARRAY[
   'Extremely affordable accommodations',
   'Very cheap local food and restaurants',
   'Student discounts at attractions',
   'Free gnome hunting and walking tours',
   'Budget-friendly trams and buses'
 ]),

(169, 'Poznan', 'Poland', 'Europe',
 'https://images.unsplash.com/photo-1640605697310-f3ff957a83b2?q=80&w=2631&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Poznan, Poland',
 'Historic city with beautiful old market, fighting goats tradition, and strong student culture. Experience colorful architecture, vibrant nightlife, and Polish hospitality.',
 26,
 'Poznan offers great student atmosphere, beautiful old town, and incredible value. Perfect for budget students who love Polish culture and vibrant nightlife.',
 ARRAY[
   'Extremely affordable accommodations',
   'Very cheap Polish cuisine',
   'Student discounts at museums',
   'Free walking tours and events',
   'Budget-friendly public transport'
 ]),

(170, 'Mykonos', 'Greece', 'Europe',
 'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?q=80&w=2274&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Mykonos, Greece',
 'Iconic Greek island with white-washed buildings, windmills, and legendary party scene. Experience beautiful beaches, vibrant nightlife, and Cycladic charm.',
 55,
 'Mykonos offers stunning island beauty, world-famous nightlife, and Greek paradise. Perfect for students seeking party atmosphere and iconic Greek island experiences.',
 ARRAY[
   'Affordable hostels and budget hotels',
   'Student-friendly beach bars',
   'Free beach access everywhere',
   'Budget-friendly Greek tavernas',
   'Cheap bus connections around island'
 ]),

(171, 'Santorini', 'Greece', 'Europe',
 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2638&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Santorini, Greece',
 'Breathtaking volcanic island with stunning sunsets, white-blue architecture, and dramatic cliffs. Experience romantic beauty, unique beaches, and unforgettable views.',
 50,
 'Santorini offers breathtaking beauty, iconic sunsets, and romantic atmosphere. Perfect for students seeking Instagram-worthy views and Greek island magic.',
 ARRAY[
   'Affordable accommodations outside Oia',
   'Budget-friendly Greek food in Fira',
   'Free sunset viewing spots',
   'Student discounts at archaeological sites',
   'Cheap bus connections around island'
 ]),

(172, 'Rhodes', 'Greece', 'Europe',
 'https://images.unsplash.com/photo-1527108097555-a5c5e36f3dd0?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Rhodes, Greece',
 'Historic island with medieval old town, beautiful beaches, and ancient ruins. Experience Knights'' heritage, stunning coastline, and authentic Greek life.',
 35,
 'Rhodes offers medieval history, beautiful beaches, and great value. Perfect for students who love history, beaches, and authentic Greek island experiences.',
 ARRAY[
   'Affordable beachside accommodations',
   'Cheap Greek food and tavernas',
   'Student discounts at Palace of Knights',
   'Free beach access everywhere',
   'Budget-friendly buses around island'
 ]),

(173, 'Ankara', 'Turkey', 'Europe',
 'https://images.unsplash.com/photo-1584816152587-382580af2d85?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Ankara, Turkey',
 'Turkey''s modern capital with stunning Anıtkabir, rich history, and central location. Experience authentic Turkish culture, ancient Hittite sites, and cosmopolitan atmosphere.',
 28,
 'Ankara offers authentic Turkish experience, rich history, and great value. Perfect for students interested in Turkish politics, history, and central Anatolian culture.',
 ARRAY[
   'Very affordable accommodations',
   'Extremely cheap Turkish food',
   'Student discounts at museums',
   'Free visits to Anıtkabir',
   'Budget-friendly metro and buses'
 ]),

(174, 'Izmir', 'Turkey', 'Europe',
 'https://images.unsplash.com/photo-1582380625189-423697e32b92?q=80&w=2671&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Izmir, Turkey',
 'Turkey''s beautiful Aegean port with stunning waterfront, ancient Ephesus nearby, and Mediterranean charm. Experience coastal Turkish life, historic sites, and warm hospitality.',
 26,
 'Izmir offers Mediterranean beauty, ancient history, and amazing value. Perfect for students who love coastal cities, archaeology, and Turkish culture.',
 ARRAY[
   'Very affordable accommodations',
   'Extremely cheap seafood and Turkish food',
   'Student discounts at Ephesus',
   'Free waterfront walks and beaches',
   'Budget-friendly ferries and buses'
 ]),
(175, 'Antalya', 'Turkey', 'Europe',
 'https://images.unsplash.com/photo-1593238739364-18cfde30e522?q=80&w=3140&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Antalya, Turkey',
 'Turkish Riviera paradise with stunning beaches, ancient ruins, and beautiful old town. Experience turquoise waters, Mediterranean climate, and affordable luxury.',
 28,
 'Antalya offers beautiful beaches, ancient history, and incredible value. Perfect for students seeking Mediterranean paradise with Turkish charm and adventure.',
 ARRAY[
   'Very affordable beachside accommodations',
   'Extremely cheap Turkish food and seafood',
   'Student discounts at ancient sites',
   'Free beach access everywhere',
   'Budget-friendly dolmuş buses'
 ]),

(176, 'Cluj-Napoca', 'Romania', 'Europe',
 'https://images.unsplash.com/photo-1666197622918-54f902bc2eea?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Cluj-Napoca, Romania',
 'Transylvania''s vibrant capital with beautiful architecture, strong student culture, and tech scene. Experience Gothic churches, festivals, and authentic Romanian life.',
 26,
 'Cluj offers vibrant student culture, beautiful architecture, and amazing value. Perfect for students who love tech, culture, and affordable Eastern European experiences.',
 ARRAY[
   'Extremely affordable accommodations',
   'Very cheap Romanian food and sarmale',
   'Student discounts at museums',
   'Free cultural events and festivals',
   'Budget-friendly public transport'
 ]),

(177, 'Timisoara', 'Romania', 'Europe',
 'https://images.unsplash.com/photo-1566209259189-5fe63e28693f?q=80&w=2022&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Timisoara, Romania',
 'Beautiful baroque city with elegant squares, vibrant culture, and revolution heritage. Experience colorful architecture, parks, and welcoming Romanian hospitality.',
 24,
 'Timisoara offers beautiful baroque architecture, vibrant culture, and incredible value. Perfect for budget students seeking elegant Eastern European charm.',
 ARRAY[
   'Extremely affordable accommodations',
   'Very cheap local food and restaurants',
   'Student discounts at cultural venues',
   'Free walking tours and park access',
   'Budget-friendly trams and buses'
 ]),

(178, 'Brno', 'Czech Republic', 'Europe',
 'https://images.unsplash.com/photo-1678305671635-9cef0f009917?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Brno, Czech Republic',
 'Czech Republic''s second city with stunning Špilberk Castle, vibrant student culture, and modernist architecture. Experience Villa Tugendhat, festivals, and authentic Czech life.',
 28,
 'Brno offers great student atmosphere, beautiful architecture, and amazing value. Perfect for students seeking authentic Czech culture without Prague crowds.',
 ARRAY[
   'Very affordable accommodations',
   'Cheap Czech beer and traditional food',
   'Student discounts at museums and castle',
   'Free walking tours and cultural events',
   'Budget-friendly public transport'
 ]),

(179, 'Ostrava', 'Czech Republic', 'Europe',
 'https://images.unsplash.com/photo-1692885277180-1fa3354fc1b8?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Ostrava, Czech Republic',
 'Industrial heritage city with unique mining museums, vibrant music scene, and authentic atmosphere. Experience post-industrial transformation and Czech working-class culture.',
 25,
 'Ostrava offers unique industrial heritage, vibrant culture, and incredible prices. Perfect for students seeking off-the-beaten-path Czech experiences.',
 ARRAY[
   'Extremely affordable accommodations',
   'Very cheap Czech beer and food',
   'Student discounts at industrial museums',
   'Free cultural events and festivals',
   'Budget-friendly public transport'
 ]),

(180, 'Rotterdam', 'Netherlands', 'Europe',
 'https://images.unsplash.com/photo-1526505917130-857817501277?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Rotterdam, Netherlands',
 'Modern architectural marvel with innovative design, vibrant port culture, and dynamic atmosphere. Experience cube houses, market hall, and contemporary Dutch lifestyle.',
 50,
 'Rotterdam offers cutting-edge architecture, vibrant culture, and modern Dutch experiences. Perfect for students interested in design, architecture, and urban innovation.',
 ARRAY[
   'Student discounts at museums',
   'Affordable student accommodations',
   'Budget-friendly international food scene',
   'Free architectural walking tours',
   'Student public transport passes'
 ]),

(181, 'Utrecht', 'Netherlands', 'Europe',
 'https://images.unsplash.com/photo-1632734395785-3ebbe0042c56?q=80&w=1364&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Utrecht, Netherlands',
 'Charming canal city with medieval center, vibrant student culture, and bike-friendly streets. Experience beautiful Dom Tower, waterfront cafes, and authentic Dutch lifestyle.',
 48,
 'Utrecht offers charming Dutch atmosphere, excellent student life, and beautiful canals. Perfect for students seeking authentic Dutch experiences with great bike culture.',
 ARRAY[
   'Student discounts at museums and tower',
   'Affordable student accommodations',
   'Budget-friendly canal-side cafes',
   'Free bike-friendly city exploration',
   'Student public transport passes'
 ]),

(182, 'The Hague', 'Netherlands', 'Europe',
 'https://images.unsplash.com/photo-1586174035695-35ab9e19215c?q=80&w=3230&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'The Hague, Netherlands',
 'Netherlands'' political capital with beautiful beach, international courts, and royal palaces. Experience Scheveningen beach, world-class museums, and diplomatic atmosphere.',
 52,
 'The Hague offers political significance, beautiful beach access, and international atmosphere. Perfect for students interested in international law and Dutch culture.',
 ARRAY[
   'Student discounts at museums and Peace Palace',
   'Affordable student accommodations',
   'Budget-friendly beach cafes',
   'Free beach access at Scheveningen',
   'Student tram and bus passes'
 ])

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
