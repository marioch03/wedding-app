# Especificación de Requisitos y Arquitectura: Aplicación Web para Boda

## 1. Rol y Objetivo del Proyecto

### Rol Asumido

- Arquitecto de Software Senior
- Product Manager
- Desarrollador Full-Stack Senior

### Objetivo Principal

Diseñar y desarrollar una aplicación web profesional para una boda real, utilizando una arquitectura limpia, modular y reutilizable para servir como base en bodas futuras.

> **Premisa clave:** No construir un SaaS multi-tenant ni una plataforma comercial compleja desde el inicio. El foco está en una boda concreta, evitando decisiones técnicas que dificulten la reutilización futura del código. No introducir multi-tenancy, billing ni gestión de múltiples organizaciones salvo justificación expresa en el MVP.

---

## 2. Stack Tecnológico

| Capa               | Tecnología / Herramienta                                                         |
| :----------------- | :------------------------------------------------------------------------------- |
| **Frontend**       | React, TypeScript, Vite                                                          |
| **Backend**        | Java, Spring Boot, Spring Security, Spring Data JPA / Hibernate, Bean Validation |
| **Base de Datos**  | PostgreSQL                                                                       |
| **Migraciones DB** | Flyway (`spring.jpa.hibernate.ddl-auto=validate`)                                |
| **Arquitectura**   | Monolito Modular (sin microservicios)                                            |

---

## 3. Alcance del Producto

El sistema consta de dos módulos principales: una **Web Pública** y un **Panel Privado de Administración**.

### 3.1. Web Pública (Invitados)

- Información general de la pareja.
- Fecha, ubicación y mapa ("Cómo llegar").
- Eventos y horarios detallados.
- Información útil/relevante para invitados.
- Galería de fotografías.
- Menús e información gastronómica.
- Contenido personalizado dinámico.
- Formulario seguro de confirmación de asistencia (**RSVP**).

### 3.2. Panel Privado (Administrador)

- Gestión de información de la boda y contenidos de la web.
- Gestión de invitados (`GUEST`) y grupos de invitación (`PARTY`).
- Generación y envío de invitaciones y enlaces seguros.
- Seguimiento y gestión de RSVP (asistencia, alergias, menús).
- Gestión de eventos y menús asociados.
- Configuración y personalización de la interfaz web.

---

## 4. Usuarios, Autenticación y Seguridad

### Autenticación con Clerk + Spring Security

- **Frontend (React):** Integra **Clerk** para registro, login, gestión de sesión, recuperación de acceso e identidad de usuario.
- **Backend (Spring Boot):** Actúa como **OAuth2 Resource Server** que valida los tokens JWT emitidos por Clerk.

### Separación de Responsabilidades

- **Autenticación:** Delegada completamente a Clerk.
- **Validación de Tokens:** Spring Security (OAuth2 JWT Resource Server).
- **Datos Propios de la Aplicación:** PostgreSQL.
- **Autorización sobre Recursos:** Spring Boot (basado en la identidad extraída del JWT validado).

### Reglas de Seguridad

1. El backend **nunca** confía en datos de identidad enviados en el body o query params; la identidad se extrae exclusivamente del JWT validado.
2. No se implementan manualmente contraseñas, refresh tokens ni sesiones en la base de datos propia.
3. Inicialmente existirá un único usuario administrador. No se introducen roles complejos (`OWNER`, `EDITOR`), organizaciones ni multi-tenancy en esta etapa.

---

## 5. Modelo de Dominio: Invitados, Eventos y RSVP

### Concepto de `PARTY`

La **`PARTY`** es la unidad fundamental de invitación y confirmación de asistencia (RSVP). Representa:

- Una persona individual.
- Una pareja.
- Una familia.
- Una persona con acompañante conocido o desconocido (+1).

### Concepto de `GUEST`

Representa a una persona individual dentro o vinculada a una `PARTY`.

### Relaciones a Diseñar

- `PARTY`
- `GUEST`
- `INVITATION`
- `RSVP`
- `RSVP_ATTENDEE`

### Eventos y Acceso Seguro a RSVP

- Una boda puede incluir múltiples eventos (Ceremonia, Cóctel, Banquete, Fiesta, Brunch).
- No todos los invitados están convocados a todos los eventos; el sistema debe permitir filtrar accesos a nivel de `PARTY`/`GUEST`.
- **Sin cuentas para invitados:** Los invitados **NO** crean cuenta de usuario. Acceden mediante enlaces únicos y seguros asociados a su `PARTY`.
- Captura de RSVP: Asistencia por evento, confirmación de asistentes, acompañantes, selección de menú, alergias/restricciones alimentarias y comentarios.

---

## 6. Personalización, Datos y Archivos

- **Contenido Dinámico:** Todo el contenido de la web pública proviene del backend/base de datos.
- **Personalización Visual:** Estilos, colores, fuentes e imágenes configurables. Se utilizará **JSONB** en PostgreSQL únicamente para configuraciones flexibles de UI y temas (sin sustituir el diseño relacional correcto de entidades de negocio).
- **Almacenamiento de Archivos:** Las imágenes y fotografías se gestionarán mediante **Object Storage** (S3/MinIO o equivalente), guardando únicamente las referencias/URLs en PostgreSQL.

---

## 7. RGPD / GDPR y Privacidad

- **Minimización de datos:** Almacenar únicamente la información necesaria para la gestión del evento.
- **Acceso restringido:** No exponer endpoints públicos que permitan enumerar o filtrar datos de invitados.
- **Gestión de ciclo de vida:** Permitir exportación y eliminación de datos personales de invitados.

---

## 8. Principios de Arquitectura y Base de Datos

### Backend (Spring Boot)

- Estructura limpia y separada: `Entities`, `DTOs`, `Repositories`, `Services`, `Controllers`, `Validators`.
- Uso de UUIDs para identificadores expuestos externamente.
- Constraints de base de datos explícitas (`Foreign Keys`, `Unique`, `Check`, `Indexes`).
- Optimistic Locking si aplica.

### Base de Datos (PostgreSQL + Flyway)

- Modificaciones de esquema estrictamente mediante scripts de migración en Flyway.
- Hibernate configurado en modo validación: `spring.jpa.hibernate.ddl-auto=validate`.

### Frontend (React + TypeScript + Vite)

- Arquitectura modular basada en **Features/Componentes**.
- Diseño Responsive, Mobile-First y Accesible.
- Preparado para SEO e internacionalización (i18n) futura sin sobreingeniería inicial.

---

## 9. Metodología de Trabajo y Próximos Pasos

### Forma de Trabajo

- Desarrollo iterativo y asistido por entregables/features.
- Análisis previo de cada decisión arquitectónica importante (alternativas, edge cases y recomendación justificada).
- Priorización absoluta de la **simplicidad, seguridad, mantenibilidad y excelente experiencia de usuario (UX)**.

---

_Documento preparado como guía de referencia arquitectónica y prompt base para el desarrollo del proyecto._
