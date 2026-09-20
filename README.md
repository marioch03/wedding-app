# Wedding App — Plataforma de Gestión de Bodas & RSVP

Plataforma web integral para la gestión y celebración de bodas, desarrollada con una arquitectura limpia de **Monolito Modular**, enfoque **Mobile-First** y altos estándares de seguridad y privacidad (**RGPD**).

El sistema proporciona una experiencia pública elegante para los invitados y un panel privado de administración para los novios u organizadores.

---

## Tabla de Contenidos

- [Propósito del Proyecto](#propósito-del-proyecto)
- [Problemas que Resuelve](#problemas-que-resuelve)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
  - [Monolito Modular](#monolito-modular)
  - [Modelo de Dominio (Party & Guest)](#modelo-de-dominio-party--guest)
  - [Estrategia de Seguridad y Autenticación](#estrategia-de-seguridad-y-autenticación)
- [Stack Tecnológico](#stack-tecnológico)
- [Funcionalidades Principales](#funcionalidades-principales)
  - [Web Pública de Invitados](#1-web-pública-de-invitados)
  - [Panel de Administración Privado](#2-panel-de-administración-privado)
- [Guía de Inicio Rápido](#guía-de-inicio-rápido)
  - [Requisitos Previos](#requisitos-previos)
  - [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
  - [Despliegue con Docker Compose (Recomendado)](#despliegue-con-docker-compose-recomendado)
  - [Desarrollo Local (Sin Docker)](#desarrollo-local-sin-docker)
- [Datos de Prueba y Sembrado](#datos-de-prueba-y-sembrado)
- [Copias de Seguridad y Restauración](#copias-de-seguridad-y-restauración)
- [Testing y Calidad](#testing-y-calidad)
- [Seguridad y Privacidad (RGPD)](#seguridad-y-privacidad-rgpd)

---

## Propósito del Proyecto

Esta aplicación está dirigida a parejas y organizadores de eventos que buscan una solución web personalizada, autónoma y de despliegue propio (*self-hosted*) para gestionar de manera integral la comunicación y confirmación de asistencia (RSVP) de su boda. 

Su arquitectura desacoplada y modular permite que el sistema funcione como una plataforma a medida para un evento específico, siendo al mismo tiempo fácilmente reutilizable y adaptable para cualquier otra boda mediante cambios en su configuración y contenidos.

---

## Problemas que Resuelve

1. **Gestión de Invitaciones Grupales y Familias**:
   - *Problema*: Los formularios tradicionales tratan a los invitados de forma aislada, dificultando gestionar familias, parejas o acompañantes (+1).
   - *Solución*: Modelo relacional basado en `PARTY` (unidad de invitación) y `GUEST` (asistente individual). Un miembro del grupo puede confirmar la asistencia de toda su unidad en un único flujo intuitivo.

2. **Eventos Múltiples con Convocatorias Segmentadas**:
   - *Problema*: Las bodas suelen componerse de varios momentos (Ceremonia, Banquete, Cóctel, Fiesta, Brunch) con invitados distintos por evento.
   - *Solución*: Segmentación dinámica de eventos por `PARTY`/`GUEST`. Cada invitado solo visualiza y confirma los eventos a los que ha sido convocado.

3. **Cero Fricción de Acceso para Invitados**:
   - *Problema*: Obligar a los invitados a registrarse con contraseñas o instalar apps provoca abandono y problemas de soporte.
   - *Solución*: Acceso mediante **tokens criptográficos únicos** (`/rsvp/:token`) y **códigos QR**. Sin registro para invitados, garantizando máxima facilidad y privacidad.

4. **Gestión Gastronómica y Alergias en Tiempo Real**:
   - *Problema*: Errores en la recogida de intolerancias, menús especiales (infantil, celíaco, vegetariano/vegano) y comentarios para el catering.
   - *Solución*: Selección individualizada de menú y recogida estructurada de restricciones alimentarias, exportables directamente a **Excel** (`.xlsx`).

5. **Personalización Dinámica sin Recompilaciones**:
   - *Problema*: Cambiar horarios, textos o fotos suele requerir modificar código y desplegar de nuevo.
   - *Solución*: El contenido de la web pública (itinerario, historia, mapas, imágenes) se gestiona de forma dinámica desde el panel de administración mediante campos estructurados y **JSONB** en PostgreSQL.

6. **Operatividad y Resiliencia**:
   - *Problema*: Pérdida accidental de respuestas de asistencia o caídas de servidor.
   - *Solución*: Backups automáticos programados diarios, scripts de restauración manual, rate limiting en endpoints públicos y monitorización con **Sentry**.

---

## Arquitectura del Sistema

### Monolito Modular
El backend sigue una arquitectura modular en Spring Boot organizada por dominios de negocio:
- `wedding`: Configuración y metadatos generales de la boda.
- `party`: Grupos familiares y unidades de invitación.
- `guest`: Invitados individuales y acompañantes.
- `event`: Sub-eventos del enlace (Ceremonia, Banquete, Fiesta...).
- `menu`: Opciones gastronómicas y tipos de dieta.
- `rsvp`: Gestión de confirmaciones de asistencia y notas especiales.
- `media`: Gestión de subida y almacenamiento de imágenes y fotografías.
- `admin`: Panel de control, estadísticas y operaciones de administración.

### Modelo de Dominio (Party & Guest)
```
┌─────────────────────────────────────────────────────────┐
│                          PARTY                          │
│  (Id, Display Name, RSVP Token, Language, Status)       │
└──────────────┬────────────────────────────┬─────────────┘
               │ 1:N                        │ N:M (via party_event)
               ▼                            ▼
┌──────────────────────────────┐     ┌─────────────────────┐
│            GUEST             │     │        EVENT        │
│ (First/Last Name, Type, +1)  │     │ (Name, Type, Venue) │
└──────────────┬───────────────┘     └──────────┬──────────┘
               │                                │
               │          GUEST_EVENT           │
               └────────►(Attending, ◄──────────┘
                          MenuOptionId,
                          SpecialNotes)
```

### Estrategia de Seguridad y Autenticación
- **Invitados (Público)**: Autenticación por token seguro en URL (`RSVP_TOKEN`). No se crean cuentas de usuario.
- **Administrador (Privado)**: Autenticación delegada a **Clerk** (Login, MFA, gestión de sesiones). El backend de Spring Boot actúa como un **OAuth2 Resource Server** que valida los tokens JWT emitidos por Clerk.
- **Protección contra Abusos**: Filtro de **Rate Limiting** por IP para prevenir ataques de fuerza bruta en endpoints públicos de RSVP y subida de archivos multimedia.

---

## Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 8, React Router 7, Axios, `@clerk/clerk-react`, `qrcode.react`, `exceljs`, `@sentry/react`, Vanilla CSS (Variables, Glassmorphism, Mobile-First) |
| **Backend** | Java 21, Spring Boot 4.1.1, Spring Security (OAuth2 JWT Resource Server), Spring Data JPA / Hibernate, Flyway, Jakarta Bean Validation, Lombok, Spring Boot Actuator, Sentry Logback |
| **Base de Datos** | PostgreSQL 16 (Alpine) con extensiones criptográficas (`pgcrypto`) y almacenamiento `JSONB` |
| **Infraestructura** | Docker & Docker Compose, Nginx (Reverse Proxy, Gzip, Security Headers, SPA Routing), `postgres-backup-local` |
| **Testing** | Vitest, React Testing Library, User Event, Mock Service Worker (MSW), Playwright (E2E), Spring Boot Test, Spring Security Test |

---

## Funcionalidades Principales

### 1. Web Pública de Invitados
- **Presentación & Historia**: Información de la pareja, fecha y cuenta atrás.
- **Localización y Cómo Llegar**: Mapas interactivos, direcciones y detalles del lugar.
- **Cronograma del Evento**: Itinerario detallado de cada parte de la boda.
- **Galería Fotográfica**: Sección visual dinámica optimizada.
- **Confirmación de Asistencia (RSVP)**:
  - Detección automática de la unidad de invitación mediante enlace/token o código QR.
  - Selección de asistencia por evento para cada miembro del grupo.
  - Elección de menú gastronómico (Estándar, Vegetariano, Vegano, Infantil, etc.).
  - Registro de alergias, intolerancias alimentarias y observaciones.

### 2. Panel de Administración Privado
- **Dashboard General**: Métricas en tiempo real de invitados confirmados, pendientes y rechazados, desglosados por evento y menú.
- **Gestión de Invitados y Grupos**:
  - Creación y edición de `PARTY` y `GUEST`.
  - Asignación de acompañantes (+1) e invitados infantiles.
  - Generación de enlaces únicos de RSVP y descarga de códigos QR.
  - Importación/Exportación de listas a formato **Excel (`.xlsx`)** para catering y fincas.
- **Gestión de Eventos y Menús**: Configuración de horarios, ubicaciones y opciones de menú por evento.
- **Personalización Web**: Ajuste de textos, contenidos e imágenes de la página pública.

---

## Guía de Inicio Rápido

### Requisitos Previos
- [Docker](https://docs.docker.com/get-docker/) y Docker Compose (recomendado para ejecución completa).
- [Java 21 JDK](https://adoptium.net/) y [Node.js 20+](https://nodejs.org/) (opcional, para desarrollo local sin Docker).

### Configuración de Variables de Entorno
Copia la plantilla `.env.example` a `.env` en la raíz del proyecto y ajusta los valores necesarios:

```bash
cp .env.example .env
```

Asegúrate de configurar al menos:
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `CLERK_ISSUER_URI` (URL de tu instancia de Clerk en el backend)
- `VITE_CLERK_PUBLISHABLE_KEY` (Clave pública de Clerk en el frontend)

---

### Despliegue con Docker Compose (Recomendado)

Inicia todos los servicios (PostgreSQL, Backups, Backend y Frontend/Nginx):

```bash
docker compose up -d --build
```

Una vez levantados los contenedores:
- **Web Pública y Panel de Administración**: `http://localhost` (o `http://<tu-dominio>` según el puerto definido en `FRONTEND_PORT`).
- **Backend API (Directo)**: `http://localhost:8080` (o a través del proxy inverso en `/api/`).
- **Comprobación de Estado (Healthcheck)**: `http://localhost:8080/actuator/health` (o `http://<tu-dominio>/actuator/health`).

Para detener los servicios:
```bash
docker compose down
```

---

### Desarrollo Local (Sin Docker)

Si prefieres ejecutar los servicios en tu entorno local de desarrollo:

#### 1. Base de Datos
Inicia únicamente el servicio de base de datos con Docker:
```bash
docker compose up -d db
```

#### 2. Backend (Spring Boot)
```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

#### 3. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
La aplicación web estará disponible localmente en `http://localhost:5173`.

---

## Datos de Prueba y Sembrado

El proyecto incluye un script para poblar la base de datos con datos de ejemplo (pareja, eventos, menús, grupos de invitados con tokens de prueba):

```bash
# Con el contenedor de base de datos en ejecución
chmod +x scripts/seed-initial-data.sh
./scripts/seed-initial-data.sh
```

---

## Copias de Seguridad y Restauración

El servicio `db-backup` realiza copias de seguridad automáticas diarias en el directorio `./backups/db`. Además, se disponen de scripts para gestión manual:

- **Realizar Backup Inmediato**:
  ```bash
  chmod +x scripts/backup-now.sh
  ./scripts/backup-now.sh
  ```

- **Restaurar una Copia de Seguridad**:
  ```bash
  chmod +x scripts/restore-db.sh
  ./scripts/restore-db.sh backups/db/<nombre_archivo_backup>.sql.gz
  ```

---

## Testing y Calidad

### Tests en el Frontend
```bash
cd frontend

# Tests Unitarios y de Integración con Vitest
npm run test

# Tests en modo escucha (watch)
npm run test:watch

# Tests End-to-End con Playwright
npm run test:e2e
```

### Tests en el Backend
```bash
cd backend

# Ejecución de tests unitarios y de integración de Spring Boot
./mvnw test
```

---

## Seguridad y Privacidad (RGPD)

- **Minimización de Datos**: Se almacenan únicamente los datos imprescindibles para la organización del evento.
- **Protección de Enlaces RSVP**: No existen endpoints públicos que permitan listar o enumerar datos personales de invitados.
- **Validación de Identidad**: El backend valida estrictamente la firma JWT con el emisor de Clerk y nunca confía en parámetros de usuario suministrados en el body o query params.
- **Aislamiento de Red**: En producción con Docker, la base de datos y el backend solo escuchan en interfaces internas (`127.0.0.1` / red Docker `wedding-network`), exponiendo únicamente el servidor web Nginx con cabeceras de seguridad reforzadas (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`).
