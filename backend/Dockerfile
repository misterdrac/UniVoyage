# ---------- BUILD STAGE ----------
FROM eclipse-temurin:23-jdk AS build
WORKDIR /app

# kopiraj samo build definicije (cache-friendly)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

RUN chmod +x mvnw

# Maven cache
RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -q -DskipTests dependency:go-offline

# kopiraj source
COPY src src

# build s cacheom
RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -q -DskipTests clean package && \
    JAR=$(ls target/*.jar | grep -v "original" | head -n 1) && \
    cp "$JAR" target/app.jar


# ---------- RUNTIME STAGE ----------
FROM eclipse-temurin:23-jre
WORKDIR /app

COPY --from=build /app/target/app.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
