import { test, expect } from '@playwright/test';
import { mockWeddingData, mockEventsData, mockRsvpInitialParty } from './fixtures/guestData';

test.describe('Experiencia del Invitado - Confirmación de Asistencia (RSVP)', () => {
  const TEST_TOKEN = 'TOKEN-GARCIA-2026';

  test.beforeEach(async ({ page }) => {
    // Interceptar llamadas a wedding y events
    await page.route('**/api/v1/public/wedding', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockWeddingData),
      });
    });

    await page.route('**/api/v1/public/events', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockEventsData),
      });
    });
  });

  test('Escenario 1: Flujo completo de confirmación con enlace personalizado (Token)', async ({ page }) => {
    let submittedPayload: any = null;

    // Interceptar llamadas al endpoint de RSVP para el token
    await page.route(`**/api/v1/public/rsvp/${TEST_TOKEN}`, async (route) => {
      if (route.request().method() === 'POST') {
        submittedPayload = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockRsvpInitialParty),
        });
      }
    });

    // 1. El invitado entra directamente con su enlace personalizado
    await page.goto(`/rsvp/${TEST_TOKEN}`);

    // 2. Comprueba que se muestra el nombre de su grupo/familia
    await expect(page.locator('h1')).toContainText('Familia García');
    await expect(page.getByText('Carlos García')).toBeVisible();
    await expect(page.getByText('Acompañante (+1)')).toBeVisible();

    const guestCards = page.locator('div[class*="guestCard"]');
    const carlosCard = guestCards.first();
    const plusOneCard = guestCards.nth(1);

    // 3. Carlos García confirma asistencia a Ceremonia y Banquete
    const attendButtons = carlosCard.locator('button:has-text("✓ Asistiré")');
    await attendButtons.first().click(); // Ceremonia
    await attendButtons.nth(1).click(); // Banquete

    // Selecciona el Menú Carne para Carlos
    await carlosCard.locator('text=Menú Carne (Solomillo)').click();

    // Añade restricción dietética para Carlos
    await carlosCard.locator('textarea').fill('Sin gluten (celíaco)');

    // 4. Configurar el acompañante (+1)
    await plusOneCard.locator('input[placeholder="Nombre"]').fill('Marta');
    await plusOneCard.locator('input[placeholder="Apellidos"]').fill('Romero');

    // Marta confirma asistencia a Banquete y elige Menú Pescado
    const plusOneAttendButtons = plusOneCard.locator('button:has-text("✓ Asistiré")');
    await plusOneAttendButtons.nth(1).click();
    await plusOneCard.locator('text=Menú Pescado (Lubina)').click();

    // 5. El invitado envía el formulario de confirmación
    const submitBtn = page.locator('button[type="submit"]:has-text("Enviar Confirmación (RSVP)")');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // 6. Verifica la pantalla de éxito
    await expect(page.getByText('¡Confirmación Enviada!')).toBeVisible();
    await expect(page.getByText('Familia García')).toBeVisible();

    // 7. Validar que los datos enviados al backend son coherentes
    expect(submittedPayload).not.toBeNull();
    expect(submittedPayload.guests).toHaveLength(2);
    expect(submittedPayload.guests[0].dietaryRequirements).toBe('Sin gluten (celíaco)');
    expect(submittedPayload.guests[1].firstName).toBe('Marta');
    expect(submittedPayload.guests[1].lastName).toBe('Romero');
  });

  test('Escenario 2: Acceso manual mediante código de invitación', async ({ page }) => {
    // Interceptar validación de código con éxito
    await page.route(`**/api/v1/public/rsvp/${TEST_TOKEN}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockRsvpInitialParty),
      });
    });

    // Interceptar código erróneo simulando 404
    await page.route('**/api/v1/public/rsvp/CODIGO-INVALIDO', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'No se encontró la invitación' }),
      });
    });

    // 1. El invitado entra a /rsvp sin token
    await page.goto('/rsvp');

    // 2. Verifica la pantalla de introducción de código
    await expect(page.locator('h1')).toContainText('Tu Invitación');
    const inputCode = page.locator('#rsvp-code');
    const submitBtn = page.locator('button[type="submit"]');

    // 3. Introduce un código incorrecto
    await inputCode.fill('CODIGO-INVALIDO');
    await submitBtn.click();

    // Verifica que se muestra alerta de error y se mantiene en la misma pantalla
    await expect(page.locator('[role="alert"]')).toBeVisible();
    await expect(page.locator('[role="alert"]')).toContainText('no es válido o ha expirado');

    // 4. Introduce el código correcto
    await inputCode.fill(TEST_TOKEN);
    await submitBtn.click();

    // 5. Verifica que accede al formulario de la Familia García
    await expect(page).toHaveURL(new RegExp(`/rsvp/${TEST_TOKEN}`));
    await expect(page.locator('h1')).toContainText('Familia García');
  });

  test('Escenario 3: Modificación y persistencia de confirmación previa', async ({ page }) => {
    const confirmedParty = {
      ...mockRsvpInitialParty,
      status: 'CONFIRMED',
      guests: [
        {
          id: 'guest-1',
          firstName: 'Carlos',
          lastName: 'García',
          isPlusOne: false,
          dietaryRestrictions: 'Intolerancia a la lactosa',
          eventAttendances: [
            {
              eventId: 'event-1',
              eventName: 'Ceremonia Civil',
              attending: true,
              respondedAt: '2026-09-01T10:00:00Z',
            },
            {
              eventId: 'event-2',
              eventName: 'Banquete & Fiesta',
              attending: true,
              menuOptionId: 'menu-carne',
              menuOptionName: 'Menú Carne (Solomillo)',
              respondedAt: '2026-09-01T10:00:00Z',
            },
          ],
        },
      ],
    };

    await page.route(`**/api/v1/public/rsvp/${TEST_TOKEN}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(confirmedParty),
      });
    });

    // 1. El invitado vuelve a entrar a su invitación ya confirmada
    await page.goto(`/rsvp/${TEST_TOKEN}`);

    // 2. Verifica el indicador de estado "✓ Confirmado"
    await expect(page.locator('text=✓ Confirmado')).toBeVisible();

    // 3. Comprueba que sus datos anteriores permanecen cargados
    const dietaryField = page.locator('textarea');
    await expect(dietaryField).toHaveValue('Intolerancia a la lactosa');

    // 4. El invitado cambia de opinión y selecciona Menú Vegano
    await page.locator('text=Menú Vegano (Risotto)').click();
    await dietaryField.fill('Ahora prefiero menú vegano');

    // 5. El botón de envío sigue habilitado para actualizar
    const submitBtn = page.locator('button[type="submit"]:has-text("Enviar Confirmación (RSVP)")');
    await expect(submitBtn).toBeEnabled();
  });
});
