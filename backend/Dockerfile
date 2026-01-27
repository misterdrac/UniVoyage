# ---------- BUILD STAGE ----------
FROM eclipse-temurin:23-jdk AS build
WORKDIR /app

# kopiraj wrapper prvo (da cache radi)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# (Windows) osiguraj da mvnw ima LF i execute permission
RUN chmod +x mvnw

# download dependencies (brže na idući build)
RUN ./mvnw -q -DskipTests dependency:go-offline

# kopiraj source i buildaj
COPY src src
RUN ./mvnw -q -DskipTests clean package && \
    ls -la target && \
    JAR=$(ls target/*.jar | grep -v "original" | head -n 1) && \
    echo "Using jar: $JAR" && \
    cp "$JAR" target/app.jar


# ---------- RUNTIME STAGE ----------
FROM eclipse-temurin:23-jre
WORKDIR /app

# uzmi jar (Spring Boot fat jar)
COPY --from=build /app/target/app.jar app.jar


EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
