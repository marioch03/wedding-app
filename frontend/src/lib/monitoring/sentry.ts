import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

/**
 * Inicializa Sentry en el Frontend con optimizaciones para el plan gratuito:
 * - Sampling de performance al 20% (tracesSampleRate: 0.2)
 * - Session Replay activo únicamente ante errores (replaysOnErrorSampleRate: 1.0, replaysSessionSampleRate: 0.0)
 * - Protección GDPR: enmascaramiento estricto de campos de entrada (maskAllInputs: true)
 * - Filtro de ruido para extensiones del navegador y errores ajenos
 */
export const initSentry = (): void => {
  if (!SENTRY_DSN) {
    // Si no hay DSN (ej: desarrollo local o tests), no se inicializa Sentry
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE || 'production',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllInputs: true,
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Tracing: 20% de transacciones para no agotar la cuota mensual
    tracesSampleRate: 0.2,
    tracePropagationTargets: ['localhost', /^\/api/, /^https?:\/\/[^/]+\/api/],

    // Session Replay: 0% sesiones normales, 100% en las que ocurran errores
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 1.0,

    // Filtro de ruido común de extensiones y navegadores
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error promise rejection captured',
      /extensions\//i,
      /^chrome-extension:\/\//i,
      /^moz-extension:\/\//i,
    ],
  });
};

export { Sentry };
