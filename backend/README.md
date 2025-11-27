# **How to run back-end?**
## 1. Pre-requisites
## Before running the back-end of this project, ensure you have the following software installed on your machine


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

### 1.3 (NOT IMPORTAINT NOV) Verify which Docker version do you have
```bash
  docker -v
```
- Make sure you have Docker 24.0.5 or higher installed. If not, please install the appropriate version, you can download Docker 24.0.5 here: https://docs.docker.com/get-docker/

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