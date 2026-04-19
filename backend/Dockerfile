# Build Stage
FROM eclipse-temurin:17-jdk AS builder
WORKDIR /app

# Copy the pom.xml and download dependencies
COPY pom.xml .
# Note: we skip dependency resolution since we don't have the full maven wrapper setup locally, 
# but copying pom first helps with layer caching.

# Copy the source code
COPY src ./src

# Build the application
# We use maven docker image to ensure maven is available in the builder stage
FROM maven:3.9.6-eclipse-temurin-17 AS maven-builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline || true
COPY src ./src
RUN mvn clean package -DskipTests

# Run Stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Add a non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy the built jar from the builder stage
COPY --from=maven-builder /app/target/*.jar app.jar

# Render supplies the port dynamically via the PORT environment variable
ENV PORT=8080

EXPOSE ${PORT}

ENTRYPOINT ["java", "-jar", "app.jar"]
