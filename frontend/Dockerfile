# ==============================================================================
# Etapa 1: Build (Node 20 en Alpine)
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Aprovechar caché de capas de Docker para dependencias
COPY package.json package-lock.json ./
RUN npm ci

# Variables de entorno necesarias durante la compilación del bundle Vite
ARG VITE_API_BASE_URL=""
ARG VITE_CLERK_PUBLISHABLE_KEY=""

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

# Copia del código fuente y compilación optimizada para producción
COPY . .
RUN npm run build

# ==============================================================================
# Etapa 2: Servidor Web de Producción (Nginx Alpine)
# ==============================================================================
FROM nginx:alpine AS runtime

WORKDIR /usr/share/nginx/html

# Limpieza de archivos estáticos por defecto de Nginx
RUN rm -rf ./*

# Copia de los archivos compilados en la etapa builder
COPY --from=builder /app/dist .

# Configuración personalizada de Nginx para SPA y Reverse Proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Puerto de escucha
EXPOSE 80

# Healthcheck de Nginx
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
