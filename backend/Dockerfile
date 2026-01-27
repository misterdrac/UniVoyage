FROM eclipse-temurin:23-jdk AS build
WORKDIR /app

# wrapper i pom iz backend foldera
COPY backend/mvnw .
COPY backend/.mvn .mvn
COPY backend/pom.xml .

RUN chmod +x mvnw
RUN ./mvnw -q -DskipTests dependency:go-offline

# source iz backend foldera
COPY backend/src src

RUN ./mvnw -q -DskipTests clean package && \
    JAR=$(ls target/*.jar | grep -v "original" | head -n 1) && \
    cp "$JAR" target/app.jar

FROM eclipse-temurin:23-jre
WORKDIR /app
COPY --from=build /app/target/app.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
