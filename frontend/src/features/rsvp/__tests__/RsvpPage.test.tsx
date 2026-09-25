import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../test/test-utils';
import { RsvpPage } from '../pages/RsvpPage';
import { Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../../../test/mocks/server';
import { mockRsvpInfo } from '../../../test/mocks/handlers';
import type { RsvpInfoResponse } from '../../../types';

const renderRsvpFlow = (initialPath: string) => {
  return renderWithRouter(
    <Routes>
      <Route path="/rsvp" element={<RsvpPage />} />
      <Route path="/rsvp/:token" element={<RsvpPage />} />
    </Routes>,
    { initialEntries: [initialPath] }
  );
};

describe('Feature: RSVP Multi-paso e Integración (RsvpPage)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.alert = vi.fn();
  });

  describe('Navegación e Ingreso de Token Manual', () => {
    it('muestra el prompt de código de invitación cuando se accede a /rsvp sin token', () => {
      renderRsvpFlow('/rsvp');

      expect(screen.getByText('Tu Invitación')).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Código de Invitación/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Continuar al formulario/i })
      ).toBeInTheDocument();
    });

    it('navega hacia /rsvp/:token al enviar el código de invitación', async () => {
      const user = userEvent.setup();
      renderRsvpFlow('/rsvp');

      const input = screen.getByLabelText(/Código de Invitación/i);
      await user.type(input, 'TOKEN123');

      const submitButton = screen.getByRole('button', { name: /Continuar al formulario/i });
      await user.click(submitButton);

      // Al navegar a /rsvp/TOKEN123, cargará la información de la invitación
      await waitFor(() => {
        expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
      });
    });

    it('muestra error inline en la misma ventana y no redirige cuando el token es inválido o no existe (TC-RSVP-002)', async () => {
      const user = userEvent.setup();
      renderRsvpFlow('/rsvp');

      const input = screen.getByLabelText(/Código de Invitación/i) as HTMLInputElement;
      await user.type(input, 'INVALID_TOKEN');

      const submitButton = screen.getByRole('button', { name: /Continuar al formulario/i });
      await user.click(submitButton);

      // Esperar a que se procese el error sin haber redirigido de ventana
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(
        screen.getByText('El código de invitación no es válido o ha expirado.')
      ).toBeInTheDocument();

      // Debe permanecer en la pantalla con el campo limpio listo para reintentar
      expect(input.value).toBe('');
      expect(screen.getByText('Tu Invitación')).toBeInTheDocument();
      expect(screen.queryByText('Familia Gómez Martínez')).not.toBeInTheDocument();
    });

    it('convierte la entrada a mayúsculas y extrae el token si se pega una URL completa', async () => {
      const user = userEvent.setup();
      renderRsvpFlow('/rsvp');

      const input = screen.getByLabelText(/Código de Invitación/i) as HTMLInputElement;

      // Al escribir en minúsculas se transforma a mayúsculas
      await user.type(input, 'gom');
      expect(input.value).toBe('GOM');

      // Al pegar una URL completa con el token extrae solo el código en mayúsculas
      await user.clear(input);
      await user.type(input, 'https://tuboda.com/rsvp/k7m4xp');
      expect(input.value).toBe('K7M4XP');
    });
  });

  describe('Carga y Renderizado de Datos de Invitación', () => {
    it('muestra el esqueleto de carga y luego renderiza los datos de la party e invitados', async () => {
      renderRsvpFlow('/rsvp/valid-token-abc');

      // Estado inicial o resolución
      await waitFor(() => {
        expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
      });

      // Validar presencia de invitados (1 regular, 1 acompañante)
      expect(screen.getByText('Marcos Gómez')).toBeInTheDocument();
      expect(screen.getByText('Acompañante (+1)')).toBeInTheDocument();

      // Validar eventos asignados
      expect(screen.getAllByText('Ceremonia Religiosa').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Cóctel y Banquete').length).toBeGreaterThan(0);

      // Validar aviso de política de privacidad
      expect(screen.getByLabelText(/Aviso de privacidad/i)).toBeInTheDocument();
      expect(
        screen.getByText(/pertenece de forma exclusiva a los novios/i)
      ).toBeInTheDocument();
    });

    it('muestra mensaje de error amigable en la pantalla de código cuando el token es inválido (404)', async () => {
      renderRsvpFlow('/rsvp/INVALID_TOKEN');

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      expect(
        screen.getByText('El código de invitación no es válido o ha expirado.')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Código de Invitación/i)
      ).toBeInTheDocument();
    });

    it('pre-rellena las opciones seleccionadas anteriormente si el invitado ya había confirmado (TC-RSVP-006)', async () => {
      const mockPriorRsvpInfo: RsvpInfoResponse = {
        ...mockRsvpInfo,
        status: 'PARTIAL',
        guests: [
          {
            ...mockRsvpInfo.guests[0],
            eventAttendances: [
              {
                eventId: 'ev-1',
                eventName: 'Ceremonia Religiosa',
                attending: true,
                respondedAt: '2026-09-10T12:00:00Z',
              },
              {
                eventId: 'ev-2',
                eventName: 'Cóctel y Banquete',
                attending: false,
                respondedAt: '2026-09-10T12:00:00Z',
              },
            ],
          },
          mockRsvpInfo.guests[1],
        ],
      };

      server.use(
        http.get('*/api/v1/public/rsvp/PRIOR_TOKEN', () => {
          return HttpResponse.json(mockPriorRsvpInfo);
        }),
        http.get('*/api/public/rsvp/PRIOR_TOKEN', () => {
          return HttpResponse.json(mockPriorRsvpInfo);
        })
      );

      renderRsvpFlow('/rsvp/PRIOR_TOKEN');

      await waitFor(() => {
        expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
      });

      // El segundo evento de Marcos Gómez debe tener "No podré asistir" marcado como activo
      const noAsistirButtons = screen.getAllByRole('button', { name: /No podré asistir/i });
      const hasActiveNo = noAsistirButtons.some((btn) => btn.className.includes('toggleActiveNo'));
      expect(hasActiveNo).toBe(true);
    });
  });

  describe('Interacción con el Formulario: Menús y Asistencia', () => {
    it('inicia con los selectores de asistencia desmarcados/neutros por defecto', async () => {
      renderRsvpFlow('/rsvp/valid-token-abc');

      await waitFor(() => {
        expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
      });

      // Ningún botón de asistencia debe tener clase activa por defecto
      const asistirButtons = screen.getAllByRole('button', { name: /✓ Asistiré/i });
      const noAsistirButtons = screen.getAllByRole('button', { name: /✕ No podré asistir/i });

      expect(asistirButtons.length).toBeGreaterThan(0);
      expect(noAsistirButtons.length).toBeGreaterThan(0);

      const hasAnyActiveYes = asistirButtons.some((btn) => btn.className.includes('toggleActiveYes'));
      const hasAnyActiveNo = noAsistirButtons.some((btn) => btn.className.includes('toggleActiveNo'));

      expect(hasAnyActiveYes).toBe(false);
      expect(hasAnyActiveNo).toBe(false);
    });

    it('permite alternar asistencia y seleccionar diferentes opciones de menú', async () => {
      const user = userEvent.setup();
      renderRsvpFlow('/rsvp/valid-token-abc');

      await waitFor(() => {
        expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
      });

      // Localizar botones de asistencia para el primer evento
      const noAsistirButtons = screen.getAllByRole('button', { name: /✕ No podré asistir/i });
      expect(noAsistirButtons.length).toBeGreaterThan(0);

      // Alternar asistencia para el primer evento (marcar no asistir)
      await user.click(noAsistirButtons[0]);
      expect(noAsistirButtons[0].className).toContain('toggleActiveNo');

      // Marcar "Asistiré" en el segundo evento (Cóctel y Banquete) para ver menús
      const asistirButtons = screen.getAllByRole('button', { name: /✓ Asistiré/i });
      await user.click(asistirButtons[1]);
      expect(asistirButtons[1].className).toContain('toggleActiveYes');

      // Verificar opciones de menú para Cóctel y Banquete (Solomillo, Risotto, Menú Infantil)
      const solomilloOption = screen.getAllByText('Solomillo Ibérico con Salsa Trufada')[0];
      const risottoOption = screen.getAllByText('Risotto de Setas Silvestres y Espárragos')[0];

      expect(solomilloOption).toBeInTheDocument();
      expect(risottoOption).toBeInTheDocument();

      // Hacemos clic en Risotto
      const risottoCard = risottoOption.closest('[role="radio"]');
      expect(risottoCard).not.toBeNull();

      if (risottoCard) {
        await user.click(risottoCard);
        expect(risottoCard).toHaveAttribute('aria-checked', 'true');
      }
    });

    it('valida que el nombre de un acompañante (+1) solo es obligatorio si confirma asistencia', async () => {
      const user = userEvent.setup();
      renderRsvpFlow('/rsvp/valid-token-abc');

      await waitFor(() => {
        expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
      });

      const plusOneInput = screen.getByPlaceholderText('Nombre');
      // No debe ser requerido por defecto si aún no confirma asistencia
      expect(plusOneInput).not.toBeRequired();

      // Si marcamos que el acompañante asistirá a un evento
      const asistirButtons = screen.getAllByRole('button', { name: /Asistiré/i });
      // Para el acompañante (segundo invitado), seleccionamos el primer evento disponible
      await user.click(asistirButtons[2]);

      expect(plusOneInput).toBeRequired();

      // Al disparar el evento submit en el formulario con el campo en blanco
      const submitButton = screen.getByRole('button', { name: /Enviar Confirmación/i });
      const form = submitButton.closest('form')!;
      fireEvent.submit(form);

      expect(window.alert).toHaveBeenCalledWith(
        'Por favor indica el nombre de tu acompañante para confirmar su asistencia.'
      );
    });

    it('permite enviar la confirmación si el acompañante no asiste o no ha respondido sin exigir su nombre', async () => {
      const user = userEvent.setup();
      renderRsvpFlow('/rsvp/valid-token-abc');

      await waitFor(() => {
        expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
      });

      const plusOneInput = screen.getByPlaceholderText('Nombre');
      expect(plusOneInput).toHaveValue('');
      expect(plusOneInput).not.toBeRequired();

      const submitButton = screen.getByRole('button', { name: /Enviar Confirmación/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('¡Confirmación Enviada!')).toBeInTheDocument();
      });
    });

    it('no permite enviar si se introduce apellido del acompañante pero se deja el nombre en blanco', async () => {
      const user = userEvent.setup();
      renderRsvpFlow('/rsvp/valid-token-abc');

      await waitFor(() => {
        expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
      });

      const plusOneLastNameInput = screen.getByPlaceholderText('Apellidos');
      await user.type(plusOneLastNameInput, 'Martínez');

      const plusOneNameInput = screen.getByPlaceholderText('Nombre');
      expect(plusOneNameInput).toBeRequired();

      const submitButton = screen.getByRole('button', { name: /Enviar Confirmación/i });
      const form = submitButton.closest('form')!;
      fireEvent.submit(form);

      expect(window.alert).toHaveBeenCalledWith(
        'Por favor indica el nombre de tu acompañante si has introducido sus apellidos.'
      );
    });

    it('permite rellenar el nombre del acompañante y las notas dietéticas', async () => {
      const user = userEvent.setup();
      renderRsvpFlow('/rsvp/valid-token-abc');

      await waitFor(() => {
        expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
      });

      // Localizar inputs del acompañante
      const plusOneNameInput = screen.getByPlaceholderText('Nombre');
      const plusOneLastNameInput = screen.getByPlaceholderText('Apellidos');

      await user.type(plusOneNameInput, 'Lucía');
      await user.type(plusOneLastNameInput, 'Fernández');

      expect(plusOneNameInput).toHaveValue('Lucía');
      expect(plusOneLastNameInput).toHaveValue('Fernández');

      // Inicialmente no se muestra el campo de alergias porque no hay asistencia a eventos con menú
      expect(screen.queryByPlaceholderText(/Celíaco, alérgico a los frutos secos/i)).not.toBeInTheDocument();

      // Al marcar asistencia al Cóctel y Banquete (evento con menú, botón 1 para el primer invitado)
      const asistirButtons = screen.getAllByRole('button', { name: /Asistiré/i });
      await user.click(asistirButtons[1]);

      // Localizar campo de alergias/restricciones que ahora se muestra
      const dietaryTextareas = screen.getAllByPlaceholderText(/Celíaco, alérgico a los frutos secos/i);
      await user.type(dietaryTextareas[0], 'Sin gluten');
      expect(dietaryTextareas[0]).toHaveValue('Sin gluten');
    });
  });

  describe('Envío del Formulario (Success y Error)', () => {
    it('envía la confirmación exitosamente y muestra la pantalla RsvpSuccess', async () => {
      const user = userEvent.setup();
      renderRsvpFlow('/rsvp/valid-token-abc');

      await waitFor(() => {
        expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
      });

      // Rellenar nombre del acompañante para pasar validación
      const plusOneNameInput = screen.getByPlaceholderText('Nombre');
      await user.type(plusOneNameInput, 'Lucía');

      // Enviar
      const submitButton = screen.getByRole('button', { name: /Enviar Confirmación/i });
      await user.click(submitButton);

      // Esperar pantalla de confirmación exitosa
      await waitFor(() => {
        expect(screen.getByText('¡Confirmación Enviada!')).toBeInTheDocument();
      });
      expect(
        screen.getByText(/Hemos registrado correctamente vuestra confirmación/i)
      ).toBeInTheDocument();

      // Probar que el botón "Modificar Respuestas" permite volver al formulario
      const editButton = screen.getByRole('button', { name: /Modificar Respuestas/i });
      await user.click(editButton);

      expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
    });

    it('muestra un mensaje de error cuando el servidor rechaza el envío (400 / error de validación)', async () => {
      const user = userEvent.setup();
      // Usar token configurado para fallar en MSW
      renderRsvpFlow('/rsvp/FAIL_SUBMIT');

      await waitFor(() => {
        expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
      });

      const plusOneNameInput = screen.getByPlaceholderText('Nombre');
      await user.type(plusOneNameInput, 'Lucía');

      const submitButton = screen.getByRole('button', { name: /Enviar Confirmación/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringContaining('Error al procesar la confirmación')
        );
      });
    });
  });
});
