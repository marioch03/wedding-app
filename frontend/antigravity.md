# INSTRUCCIONES PARA EL AGENTE DE CÓDIGO (ANTIGRAVITY CHAT)

## OBJETIVO PRINCIPAL

Desarrollar la interfaz frontend para una aplicación web de boda profesional, aplicando una arquitectura modular y un acabado visual impecable y cuidado al detalle.

---

## REQUISITOS OBLIGATORIOS DE DISEÑO Y UI

1. **Diseño e Interfaz Espectacular:**
   - Pon especial esfuerzo en que la interfaz sea visualmente impresionante, moderna y fluida. En una web de boda la primera impresión y la experiencia de usuario (UX) son fundamentales.
   - La interfaz debe cuidar las microinteracciones, los estados de carga, las animaciones suaves y la responsividad total (móvil y escritorio) para transmitir el nivel de detalle que requiere una boda profesional.
   - _Nota:_ No definas paletas de colores rígidas ni estilos base por tu cuenta; la gestión de colores, tipografías y tokens de diseño la controla directamente el usuario mediante sus propias variables CSS.

2. **Estilos Separados por Feature:**
   - **Prohibido usar estilos en línea o concentrar todo en un único archivo CSS global.**
   - Cada módulo o funcionalidad (`features/wedding`, `features/event`, `features/rsvp`, `features/admin`, etc.) debe tener su propio archivo de estilos independiente (`.module.css` o `.css` dedicado dentro de la carpeta del feature o componente).
   - Mantén el código de estilos completamente modularizado para evitar colisiones y garantizar la mantenibilidad del proyecto.

---

## CALIDAD DE CÓDIGO

- **Componentes Limpios en React + TypeScript:** Tipado estricto de props y respuestas de API sin utilizar `any`.
- **Manejo de Errores y Cargas:** Incorpora estados visuales de carga (Skeletons/Spinners) y mensajes claros de validación ante errores devueltos por la API.
