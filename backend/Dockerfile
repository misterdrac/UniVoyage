FROM eclipse-temurin:23-jdk AS build
WORKDIR /app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x mvnw

RUN ./mvnw -q -DskipTests dependency:go-offline

COPY src src
RUN ./mvnw -q -DskipTests clean package && \
    JAR=$(ls target/*.jar | grep -v "original" | head -n 1) && \
    cp "$JAR" target/app.jar

FROM eclipse-temurin:23-jre
WORKDIR /app
COPY --from=build /app/target/app.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
