# ── Build stage ───────────────────────────────────────────────────────────────
# Use official Gradle image — no wrapper needed
FROM gradle:8.9-jdk21-alpine AS build
WORKDIR /app

# Cache dependency resolution layer
COPY build.gradle settings.gradle ./
RUN gradle dependencies --no-daemon -q || true

# Build the fat jar (skip tests in Docker build)
COPY src src
RUN gradle bootJar --no-daemon -x test

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root user for security
RUN addgroup -S nlc && adduser -S nlc -G nlc
USER nlc

COPY --from=build /app/build/libs/app.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
