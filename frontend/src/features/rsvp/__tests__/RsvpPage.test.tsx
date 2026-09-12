import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../test/test-utils';
import { RsvpPage } from '../pages/RsvpPage';
import { Route, Routes } from 'react-router-dom';

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
        screen.getByRole('button', { name: /Acceder al Formulario/i })
      ).toBeInTheDocument();
    });

    it('navega hacia /rsvp/:token al enviar el código de invitación', async () => {
      const user = userEvent.setup();
      renderRsvpFlow('/rsvp');

      const input = screen.getByLabelText(/Código de Invitación/i);
      await user.type(input, 'TOKEN123');

      const submitButton = screen.getByRole('button', { name: /Acceder al Formulario/i });
      await user.click(submitButton);

      // Al navegar a /rsvp/TOKEN123, cargará la información de la invitación
      await waitFor(() => {
        expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
      });
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
    });

    it('muestra mensaje de error amigable cuando el token es inválido (404)', async () => {
      renderRsvpFlow('/rsvp/INVALID_TOKEN');

      await waitFor(() => {
        expect(screen.getByText('Invitación no encontrada')).toBeInTheDocument();
      });
      expect(
        screen.getByText(/No se encontró la invitación con el token proporcionado/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /Introducir otro código/i })
      ).toBeInTheDocument();
    });
  });

  describe('Interacción con el Formulario: Menús y Asistencia', () => {
    it('permite alternar asistencia y seleccionar diferentes opciones de menú', async () => {
      const user = userEvent.setup();
      renderRsvpFlow('/rsvp/valid-token-abc');

      await waitFor(() => {
        expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
      });

      // Localizar botones de asistencia para el primer evento
      const noAsistirButtons = screen.getAllByRole('button', { name: /No podré asistir/i });
      expect(noAsistirButtons.length).toBeGreaterThan(0);

      // Alternar asistencia para un evento
      await user.click(noAsistirButtons[0]);

      // Verificar opciones de menú para Cóctel y Banquete (Solomillo, Risotto, Menú Infantil)
      const solomilloOption = screen.getAllByText('Solomillo Ibérico con Salsa Trufada')[0];
      const risottoOption = screen.getAllByText('Risotto de Setas Silvestres y Espárragos')[0];

      expect(solomilloOption).toBeInTheDocument();
      expect(risottoOption).toBeInTheDocument();

      // El solomillo viene seleccionado por defecto (primer elemento). Hacemos clic en Risotto
      const risottoCard = risottoOption.closest('[role="radio"]');
      expect(risottoCard).not.toBeNull();

      if (risottoCard) {
        await user.click(risottoCard);
        expect(risottoCard).toHaveAttribute('aria-checked', 'true');
      }
    });

    it('valida que el nombre de un acompañante (+1) no esté vacío antes de enviar', async () => {
      renderRsvpFlow('/rsvp/valid-token-abc');

      await waitFor(() => {
        expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
      });

      const plusOneInput = screen.getByPlaceholderText('Nombre');
      expect(plusOneInput).toBeRequired();

      // Al disparar el evento submit en el formulario con el campo en blanco
      const submitButton = screen.getByRole('button', { name: /Enviar Confirmación/i });
      const form = submitButton.closest('form')!;
      fireEvent.submit(form);

      expect(window.alert).toHaveBeenCalledWith(
        'Por favor indica el nombre de tu acompañante.'
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

      // Localizar campo de alergias/restricciones
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
