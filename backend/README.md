# **How to run back-end?**

## 1. Pre-requisites
Before running the back-end of this project, ensure you have the following software installed on your machine.

### 1.1 Verify which Java version do you have
```bash
  java -version
```
- Make sure you have Java 23 or higher installed. If not, please install the appropriate version, you can download Java 23 here: https://www.oracle.com/java/technologies/javase/jdk23-archive-downloads.html , downloading this you download Java 23 SDK.
- Java SDK includes JRE (Java Runtime Environment) which is required to run Java applications. Also it includes JVM (Java Virtual Machine) which is the engine that runs Java applications. All necessary components are included in the Java SDK to run this application.

### 1.2 Verify which Maven version do you have
```bash
  mvn -v
```
- Make sure you have Maven 3.9.6 or higher installed. If not, please install the appropriate version, you can download Maven 3.9.6 here: https://maven.apache.org/download.cgi

### 1.3 API Keys, Authentication & JWT Setup (IMPORTANT)
- This project relies on several external services and secure token authentication. You need to obtain API keys and generate secrets to configure your `.env` file in the `backend` directory.

#### **A. Google OAuth2 Setup**
- To enable Google OAuth2 authentication, you need to set up a project in the Google Developers Console and obtain OAuth2 credentials.
- Follow these steps to set up Google OAuth2:
    1. Go to the [Google Developers Console](https://console.developers.google.com/).
    2. Create a new project or select an existing one.
    3. Navigate to "Credentials" and click on "Create Credentials" > "OAuth 2.0 Client ID".
    4. Configure the consent screen and set the application type to "Web application".
    5. Add authorized redirect URIs (for our app, this is http://localhost:5173/auth/google/callback)
    6. Save the credentials and note down the Client ID and Client Secret.

#### **B. OpenWeather API Setup**
- Required for fetching weather forecasts for destinations.
    1. Go to [OpenWeatherMap](https://openweathermap.org/api) and sign up.
    2. Navigate to "My API Keys".
    3. Generate a new key and copy it.

#### **C. Geoapify API Setup**
- Required for location services and autocomplete features.
    1. Register at [Geoapify](https://www.geoapify.com/).
    2. Go to the "Projects" dashboard.
    3. Create a new project and copy the API Key.

#### **D. Google Gemini API Setup**
- Required for AI-powered travel recommendations.
    1. Visit [Google AI Studio](https://aistudio.google.com/).
    2. Click on "Get API key".
    3. Create an API key in a new or existing project and copy it.

#### **E. Amadeus Hotel API Setup**
- Required for searching hotels and accommodations.
    1. Register for a developer account at [Amadeus for Developers](https://developers.amadeus.com/).
    2. Create a new "Self-Service" app in your workspace.
    3. You will receive an **API Key** (Client ID) and an **API Secret** (Client Secret).

#### **F. JWT Secret Generation**
- The application uses JSON Web Tokens (JWT) for security. You need a strong, random 256-bit (32-byte) secret key.
- You can generate one quickly using the terminal (requires OpenSSL, usually installed by default on Git Bash or Mac/Linux):
```bash
  openssl rand -base64 32
```
- Alternatively, you can use an online generator like [GenerateRandomStrings](https://www.random.org/strings/) (make sure it is long and random).
- Copy the generated string.

#### **G. Configure .env file**
- Recommended: Check the `.env.example` file in the `backend` directory for reference.
- Create or update the `.env` file in the `backend` directory with all the keys you obtained:
```env
  # Google OAuth2
  GOOGLE_CLIENT_ID=your_google_client_id
  GOOGLE_CLIENT_SECRET=your_google_client_secret
  GOOGLE_REDIRECT_URI=your_google_redirect_uri

  # JWT Configuration
  JWT_SECRET=your_generated_jwt_secret_string
  JWT_EXPIRATION=86400000

  # External APIs
  OPENWEATHER_API_KEY=your_openweather_key
  GEOAPIFY_API_KEY=your_geoapify_key
  GEMINI_API_KEY=your_gemini_key
  
  # Amadeus API
  AMADEUS_CLIENT_ID=your_amadeus_client_id
  AMADEUS_CLIENT_SECRET=your_amadeus_client_secret

  # ExchangeRate-API (trip currency / FX)
  EXCHANGE_RATE_API_KEY=your_exchangerate_api_key
```

### 1.4 Verify which Docker version do you have
```bash
  docker -v
```
- Make sure you have Docker 24.0.5 or higher installed. If not, please install the appropriate version, you can download Docker 24.0.5 here: https://www.docker.com/products/docker-desktop/ . Docker is required to run the application, but it can be used to set up the database and other services in a containerized environment if you prefer that approach. Honestly it's not required to run the application, but it's preferable to use it since it will make the setup easier and faster, especially for the database.

## 2. Environment setup

### 2.1 Clone the repository
- If you haven't already, clone the repository to your local machine using the following command:
```bash
  git clone https://github.com/misterdrac/UniVoyage
```     
- Navigate to the backend directory:
```bash
  cd UniVoyage/backend
```

### 2.2 Database configuration
- The application uses PostgreSQL as its database. You need to set up a PostgreSQL database instance and configure the connection settings in the `application.properties` file located in the `src/main/resources` directory.
- Make sure you have downloaded and installed PostgreSQL 18 from https://www.postgresql.org/download/
- Do NOT forget to set up a user with the appropriate permissions for the database you will create.
- Create a new database for the application (e.g., `univoyage_db`).
- Update the following properties in the `application.properties` file with your database details:
```properties
# PostgreSQL 18 Database Configuration
spring.datasource.url=jdbc:postgresql://${DB_HOST:${HOST:localhost}}:${DB_PORT:5432}/${DB_NAME:univoyage_db}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
```
- Replace `${DB_HOST}`, `${DB_PORT}`, `${DB_NAME}`, `${DB_USERNAME}`, and `${DB_PASSWORD}` with your actual database host, port, name, username, and password.
- Alternatively, you can set these values as environment variables in your `.env` file.

## 3. Running the application

### 3.1 Run via IDE
- You can run the application directly from your IDE (e.g., IntelliJ IDEA, Eclipse) by importing the Maven project and running the `main` method in the `com.univoyage.backend.BackendApplication` class.

### 3.2 Run via Maven (Recommended)
- Open a terminal and navigate to the `backend` directory of the project.
- Use the following Maven command to build and run the application:
```bash
  mvn spring-boot:run
```
- The application will start, and you should see logs indicating that the server is running on `http://localhost:8080`.
- Something like this should appear in the terminal:
```plaintext
  ...
  2025-11-27T15:38:15.165+01:00  INFO 17384 --- [UniVoyage] [  restartedMain] o.s.o.j.p.SpringPersistenceUnitInfo      : No LoadTimeWeaver setup: ignoring JPA class transformer
2025-11-27T15:38:15.238+01:00  WARN 17384 --- [UniVoyage] [  restartedMain] org.hibernate.orm.deprecation            : HHH90000025: PostgreSQLDialect does not need to be specified explicitly using 'hibernate.dialect' (remove the property setting and it will be selected by default)
2025-11-27T15:38:15.253+01:00  INFO 17384 --- [UniVoyage] [  restartedMain] org.hibernate.orm.connections.pooling    : HHH10001005: Database info:
        Database JDBC URL [Connecting through datasource 'HikariDataSource (HikariPool-1)']
        Database driver: undefined/unknown
        Database version: 18.1
        Autocommit mode: undefined/unknown
        Isolation level: undefined/unknown
        Minimum pool size: undefined/unknown
        Maximum pool size: undefined/unknown
2025-11-27T15:38:16.174+01:00  INFO 17384 --- [UniVoyage] [  restartedMain] o.h.e.t.j.p.i.JtaPlatformInitiator       : HHH000489: No JTA platform available (set 'hibernate.transaction.jta.platform' to enable JTA platform integration)
2025-11-27T15:38:16.238+01:00  INFO 17384 --- [UniVoyage] [  restartedMain] j.LocalContainerEntityManagerFactoryBean : Initialized JPA EntityManagerFactory for persistence unit 'default'
2025-11-27T15:38:16.915+01:00  WARN 17384 --- [UniVoyage] [  restartedMain] JpaBaseConfiguration$JpaWebConfiguration : spring.jpa.open-in-view is enabled by default. Therefore, database queries may be performed during view rendering. Explicitly configure spring.jpa.open-in-view to disable this warning
2025-11-27T15:38:16.999+01:00  INFO 17384 --- [UniVoyage] [  restartedMain] r$InitializeUserDetailsManagerConfigurer : Global AuthenticationManager configured with UserDetailsService bean with name customUserDetailsService
2025-11-27T15:38:17.563+01:00  INFO 17384 --- [UniVoyage] [  restartedMain] o.s.b.a.e.web.EndpointLinksResolver      : Exposing 1 endpoint beneath base path '/actuator'
2025-11-27T15:38:18.478+01:00  INFO 17384 --- [UniVoyage] [  restartedMain] o.s.b.d.a.OptionalLiveReloadServer       : LiveReload server is running on port 35729
2025-11-27T15:38:18.679+01:00  INFO 17384 --- [UniVoyage] [  restartedMain] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port 8080 (http) with context path '/'
2025-11-27T15:38:18.698+01:00  INFO 17384 --- [UniVoyage] [  restartedMain] c.u.univoyage.UniVoyageApplication       : Started UniVoyageApplication in 7.912 seconds (process running for 8.52
  ...
```
- You should be able to access the application at `http://localhost:8080` but you can't since our front-end is hosted in another port (5173) and it will communicate with the back-end through that port.
- You as a user should not be able to access the back-end directly through the browser.

### 3.3 API docs (Swagger UI)
- With the default profile (not `prod`), interactive OpenAPI docs are available:
  - **Swagger UI:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
  - **OpenAPI JSON:** [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)
- Call `POST /api/auth/login` or `POST /api/auth/register`, copy the JWT from the response, then in Swagger click **Authorize**, choose **bearer-jwt**, and paste `Bearer <token>` or just the raw token (depending on UI; usually paste the token only).
- The `prod` profile **disables** Swagger UI and `/v3/api-docs` (see `application-prod.yml`).

### 3.4 Run via Docker (Highly Recommended)
- If you prefer to run the application in a containerized environment, you can use Docker. Make sure you have Docker installed and running on your machine.
- We have Dockerfile in our backend directory that defines how to build the Docker image for the back-end application. You can build and run the Docker container using the following commands:
```bash
  # Build image from Dockerfile and start the container
  docker compose up --build -d

  # Stop and remove containers
  docker compose down
```
- to verify that the container is running, you can use the following command:
```bash
  docker ps
```
- or you can go to Docker Desktop and check the "Containers/Apps" section to see if the container is running. You should see Docker image named "backend" and under that image are two containers, one for the back-end application and another for the PostgreSQL database.
- This will build the Docker image for the back-end application and start it in a container. The application will be accessible at `http://localhost:8080` and it will be able to communicate with the front-end running on port 5173.
- Using Docker is highly recommended as it simplifies the setup process and ensures that all dependencies are correctly