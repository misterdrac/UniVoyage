FROM eclipse-temurin:23-jdk AS build
WORKDIR /app

# Kopiramo Maven wrapper i pom.xml
# Napomena: Putanje ovise o tome pokrećeš li 'docker build' iz root-a projekta
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

RUN chmod +x mvnw
# Dohvaćamo dependencije (ovaj layer će biti cache-iran dok se pom.xml ne promijeni)
RUN ./mvnw dependency:go-offline

# Kopiramo cijeli source
COPY src src

# Buildamo aplikaciju i fiksiramo ime JAR-a da izbjegnemo greške s verzijama
RUN ./mvnw clean package -DskipTests && \
    mv target/*.jar target/app.jar

# Finalni runtime stage
FROM eclipse-temurin:23-jre
WORKDIR /app

# Kopiramo samo JAR iz build faze
COPY --from=build /app/target/app.jar app.jar

# Definiramo enviroment varijable koje Spring prepoznaje (defaulti)
ENV SPRING_PROFILES_ACTIVE=docker

EXPOSE 8080

# Pokrećemo aplikaciju
ENTRYPOINT ["java", "-jar", "app.jar"]