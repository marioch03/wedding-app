# ==============================================================================
# Etapa 1: Build (Maven + OpenJDK 21 en Alpine)
# ==============================================================================
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Aprovechamiento de la caché de capas de Docker para dependencias
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copia del código fuente y compilación del artefacto de producción
COPY src ./src
RUN mvn clean package -DskipTests -B

# ==============================================================================
# Etapa 2: Runtime (JRE 21 mínimo en Alpine)
# ==============================================================================
FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

# Creación de usuario y grupo de sistema no privilegiado para seguridad
RUN addgroup -g 10001 -S appgroup && \
    adduser -u 10001 -S appuser -G appgroup

# Creación de directorios para subida de medios y asignación de permisos a appuser
RUN mkdir -p /app/uploads/images && \
    chown -R appuser:appgroup /app

# Copia del artefacto JAR compilado desde la etapa builder
COPY --from=builder --chown=appuser:appgroup /build/target/app.jar app.jar

# Cambio al usuario no-root
USER appuser

# Parámetros JVM optimizados para entornos en contenedores
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -Djava.security.egd=file:/dev/./urandom"

# Puerto de escucha del backend
EXPOSE 8080

# Healthcheck hacia el endpoint de Actuator
HEALTHCHECK --interval=15s --timeout=5s --start-period=35s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
