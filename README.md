# 🌍 UniVoyage

**UniVoyage** is a modern, full-stack **travel planning and trip management application** designed to help users plan smarter, more personalized, and budget-aware trips using real-time data and AI assistance.

The application brings together **trip creation**, **budget management**, **student-friendly travel data**, **maps**, **weather forecasts**, **AI-generated itineraries**, and a **CMS system** into one unified platform.

---

## 🎯 What is UniVoyage?

UniVoyage is a **smart travel companion** that supports users from the moment they decide to travel until they have a fully structured daily itinerary, packing list, and budget overview.

Instead of switching between multiple tools (maps, weather apps, booking platforms, notes, spreadsheets), UniVoyage centralizes everything and enhances it with **context-aware AI** and **live external APIs**.

---

## 👥 Who is UniVoyage for?

- 🎓 **Students** and young travelers
- ✈️ **Budget-conscious travelers**
- 🧳 **Backpackers & digital nomads**
- 🌍 Travelers who want **structured and intelligent planning**
- 💼 Recruiters reviewing a real-world full-stack portfolio project

---

## ⭐ Why people would use UniVoyage

- One place for **entire trip planning**
- **Budget control** at every stage
- **Student-friendly hotel discovery**
- **Weather-aware travel suggestions**
- **AI-generated itineraries & packing lists**
- Interactive **maps with points of interest**
- Clean separation of user and admin (CMS) functionality

---

## 🚀 Main Features

### 🧭 Trip Builder
- Create trips with:
    - destinations
    - start & end dates
    - total trip duration
- Fully editable trips at any time
- Dynamic structure supporting multi-day trips
- Budget can be **updated at any point during the trip lifecycle**

---

### 💰 Budget per Trip
- Set or change total trip budget anytime
- Expense tracking per category:
    - accommodation
    - transport
    - food
    - activities
- Budget insights during planning
- Budget context passed into AI recommendations

---

### 🏨 Student-Friendly Hotels (Amadeus API)
- Integration with **Amadeus API**
- Displays a list of **student-friendly hotels** for selected destinations
- Helps users choose affordable and suitable accommodation
- Hotel data can influence:
    - budget planning
    - itinerary suggestions

---

### 🌤️ Weather Forecast (OpenWeather API)
- Shows **3–5 day weather forecast** for trip destinations
- Weather data is dynamically loaded based on:
    - destination
    - travel dates
- Weather context is used across:
    - trip planning
    - AI recommendations
    - packing suggestions

---

### 🗺️ Maps & Points of Interest (Geoapify + OpenStreetMap)
- Interactive map view powered by **OpenStreetMap**
- **Geoapify API** provides:
    - geographic data
    - nearby attractions
    - points of interest (POI)
- “Things to Visit” section lists POIs returned by Geoapify
- All POIs are visualized directly on the map

---

### 🤖 AI Travel Assistant (Google Gemini)

The **Google Gemini API** is a core intelligence layer in UniVoyage.

#### ✨ AI-Generated Daily Itineraries
- Automatically generates **day-by-day itineraries**
- Number of days is derived from trip duration
- Takes into account:
    - destination
    - weather forecast
    - points of interest
    - budget
    - user preferences
- Produces realistic daily travel plans instead of generic suggestions

#### 🎒 Smart Packing Suggestions
- Generates **packing lists** based on:
    - destination
    - weather forecast
    - trip duration
- Includes:
    - clothing suggestions
    - weather-specific items
    - travel documents
    - essential accessories
- Adapts packing advice dynamically if weather or dates change

#### 💡 Context-Aware Recommendations
- Suggests activities based on weather conditions
- Provides budget-friendly alternatives
- Uses real trip data instead of static prompts

---

### 🛠️ CMS (Admin Panel)
- Dedicated admin section
- Full CRUD management for:
    - users
    - destinations
    - countries (to be implemented)
    - languages (to be implemented)
    - hobbies (to be implemented)
- Role-based access (HEAD_ADMIN, ADMIN , USER)
- Centralized content control for the entire platform

---

### 👤 User Profile Management
- Edit personal details
- Manage interests and preferences
- Select country of origin and languages
- Profile data is used to personalize:
    - AI responses
    - trip recommendations

---

### 🔐 Authentication & Security
- JWT authentication (stored in HttpOnly cookies)
- Google OAuth2 login
- Role-based authorization
- Centralized exception handling

---

## 🌐 External APIs Used

- **OpenWeather** – 3–5 day weather forecasts
- **Geoapify** – geolocation, POIs, places to visit
- **Amadeus** – student-friendly hotel listings
- **OpenStreetMap** – interactive maps
- **Google Gemini** – AI itineraries, packing lists, recommendations

---

## 🧱 Tech Stack

### Backend
- Java 23
- Spring Boot
- Spring Security (JWT + OAuth2)
- Hibernate / JPA
- Flyway (database migrations)
- PostgreSQL
- Maven

### Frontend
- React
- Vite
- JavaScript / TypeScript
- Component-based architecture

### AI & Integrations
- Google Gemini API
- OpenWeather API
- Geoapify API
- Amadeus API
- OpenStreetMap

---
