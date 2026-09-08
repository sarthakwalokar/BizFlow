# Stage 1: Build the Spring Boot application using Maven
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app

# Copy Maven wrapper, POM and backend source code
COPY backend/pom.xml ./backend/
COPY backend/.mvn ./backend/.mvn
COPY backend/mvnw ./backend/
COPY backend/src ./backend/src

# Set working directory to backend and package application
WORKDIR /app/backend
RUN chmod +x ./mvnw && ./mvnw clean package -DskipTests

# Stage 2: Lightweight runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy built artifact from builder stage
COPY --from=builder /app/backend/target/*.jar app.jar

# Expose backend port
EXPOSE 8080

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
