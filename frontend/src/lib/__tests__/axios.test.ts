import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/mocks/server';
import {
  apiClient,
  setAuthTokenGetter,
  ApiError,
  handleResponseError,
  type ApiErrorResponse,
} from '../axios';
import type { AxiosError } from 'axios';

describe('Cliente HTTP y Manejo de Errores (src/lib/axios.ts)', () => {
  beforeEach(() => {
    // Resetear getter de autenticación antes de cada prueba
    setAuthTokenGetter(async () => null);
  });

  describe('Autenticación y Encabezados Bearer Token', () => {
    it('adjunta el encabezado "Authorization: Bearer <token>" cuando hay un token disponible', async () => {
      let interceptedAuthHeader: string | null = null;

      server.use(
        http.get('*/api/test-auth', ({ request }) => {
          interceptedAuthHeader = request.headers.get('Authorization');
          return HttpResponse.json({ success: true });
        })
      );

      const fakeToken = 'sample-clerk-jwt-token-xyz';
      setAuthTokenGetter(async () => fakeToken);

      const response = await apiClient.get('/api/test-auth');

      expect(response.status).toBe(200);
      expect(interceptedAuthHeader).toBe(`Bearer ${fakeToken}`);
    });

    it('no adjunta el encabezado Authorization cuando el token es null o está indefinido', async () => {
      let interceptedAuthHeader: string | null = null;

      server.use(
        http.get('*/api/test-auth-empty', ({ request }) => {
          interceptedAuthHeader = request.headers.get('Authorization');
          return HttpResponse.json({ success: true });
        })
      );

      setAuthTokenGetter(async () => null);

      await apiClient.get('/api/test-auth-empty');

      expect(interceptedAuthHeader).toBeNull();
    });
  });

  describe('Transformación de Errores HTTP a ApiError', () => {
    it('transforma un error 401 Unauthorized en una instancia de ApiError con status 401', async () => {
      server.use(
        http.get('*/api/test-401', () => {
          return HttpResponse.json(
            {
              status: 401,
              error: 'Unauthorized',
              message: 'Token expirado o no válido',
            },
            { status: 401 }
          );
        })
      );

      try {
        await apiClient.get('/api/test-401');
        expect.fail('Se esperaba que la llamada lanzara un ApiError');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiError = err as ApiError;
        expect(apiError.status).toBe(401);
        expect(apiError.message).toBe('Token expirado o no válido');
      }
    });

    it('transforma un error 403 Forbidden en una instancia de ApiError con status 403', async () => {
      server.use(
        http.get('*/api/test-403', () => {
          return HttpResponse.json(
            {
              status: 403,
              error: 'Forbidden',
              message: 'Acceso denegado a recursos administrativos',
            },
            { status: 403 }
          );
        })
      );

      try {
        await apiClient.get('/api/test-403');
        expect.fail('Se esperaba que la llamada lanzara un ApiError');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiError = err as ApiError;
        expect(apiError.status).toBe(403);
        expect(apiError.message).toBe('Acceso denegado a recursos administrativos');
      }
    });

    it('transforma respuestas del backend con fieldErrors preservando el mapa de errores de validación', async () => {
      const fieldErrorsMap = {
        email: 'El formato de correo no es válido',
        partner1Name: 'El nombre del primer contrayente es obligatorio',
      };

      server.use(
        http.post('*/api/test-validation', () => {
          return HttpResponse.json(
            {
              status: 400,
              error: 'Bad Request',
              message: 'Datos de entrada inválidos',
              fieldErrors: fieldErrorsMap,
            },
            { status: 400 }
          );
        })
      );

      try {
        await apiClient.post('/api/test-validation', {});
        expect.fail('Se esperaba que la llamada fallara con error de validación');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiError = err as ApiError;
        expect(apiError.status).toBe(400);
        expect(apiError.message).toBe('Datos de entrada inválidos');
        expect(apiError.fieldErrors).toEqual(fieldErrorsMap);
        expect(apiError.fieldErrors?.email).toBe('El formato de correo no es válido');
      }
    });

    it('transforma un fallo de red (Network Error) en ApiError con status 0 y mensaje explicativo', async () => {
      server.use(
        http.get('*/api/test-network-error', () => {
          return HttpResponse.error();
        })
      );

      try {
        await apiClient.get('/api/test-network-error');
        expect.fail('Se esperaba que la llamada lanzara un error de red');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiError = err as ApiError;
        expect(apiError.status).toBe(0);
        expect(apiError.message).toContain('No se pudo conectar con el servidor');
      }
    });
  });

  describe('Función handleResponseError (Unit Tests aislados)', () => {
    it('mapea correctamente un error con response personalizada', () => {
      const mockAxiosError = {
        response: {
          status: 409,
          data: {
            message: 'Conflicto: el recurso ya existe',
            fieldErrors: { code: 'Código duplicado' },
          },
        },
      } as unknown as AxiosError<ApiErrorResponse>;

      expect(() => handleResponseError(mockAxiosError)).toThrowError(ApiError);
      try {
        handleResponseError(mockAxiosError);
      } catch (err: unknown) {
        const e = err as ApiError;
        expect(e.status).toBe(409);
        expect(e.message).toBe('Conflicto: el recurso ya existe');
        expect(e.fieldErrors?.code).toBe('Código duplicado');
      }
    });

    it('mapea correctamente un error con request sin response (caída de red)', () => {
      const mockAxiosError = {
        request: {},
      } as unknown as AxiosError<ApiErrorResponse>;

      try {
        handleResponseError(mockAxiosError);
      } catch (err: unknown) {
        const e = err as ApiError;
        expect(e).toBeInstanceOf(ApiError);
        expect(e.status).toBe(0);
        expect(e.message).toContain('No se pudo conectar con el servidor');
      }
    });

    it('mapea un error inesperado de configuración con status 500', () => {
      const mockAxiosError = {
        message: 'Error interno de configuración de Axios',
      } as unknown as AxiosError<ApiErrorResponse>;

      try {
        handleResponseError(mockAxiosError);
      } catch (err: unknown) {
        const e = err as ApiError;
        expect(e).toBeInstanceOf(ApiError);
        expect(e.status).toBe(500);
        expect(e.message).toBe('Error interno de configuración de Axios');
      }
    });
  });
});
