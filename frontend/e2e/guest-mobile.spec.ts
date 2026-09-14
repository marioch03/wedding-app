import { test, expect } from '@playwright/test';
import { mockWeddingData, mockEventsData, mockRsvpInitialParty } from './fixtures/guestData';

test.describe('Experiencia del Invitado - Smartphone / Móvil (Responsive)', () => {
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 12/13/14 estándar

  test.beforeEach(async ({ page }) => {
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

    await page.route('**/api/v1/public/rsvp/TOKEN-MOVIL', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockRsvpInitialParty),
      });
    });
  });

  test('La portada y el cronograma se visualizan sin desbordamiento horizontal en móvil', async ({ page }) => {
    await page.goto('/');

    // Verificar que los textos principales caben en pantalla
    await expect(page.getByText('Elena', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Alejandro', { exact: true }).first()).toBeVisible();

    // Comprobar que no hay scroll horizontal indeseado en la página
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // tolerancia de 2px por redondeo de viewport
  });

  test('El formulario RSVP es táctil y fluido en pantallas pequeñas', async ({ page }) => {
    await page.goto('/rsvp/TOKEN-MOVIL');

    // Comprobar visualización de cabecera y tarjetas
    await expect(page.locator('h1')).toContainText('Familia García');

    // Probar interacción con los botones táctiles
    const firstAttendBtn = page.locator('button:has-text("✓ Asistiré")').first();
    await expect(firstAttendBtn).toBeVisible();
    await firstAttendBtn.click();

    // Comprobar que el botón de confirmación final es accesible y visible
    const submitBtn = page.locator('button[type="submit"]:has-text("Enviar Confirmación (RSVP)")');
    await expect(submitBtn).toBeVisible();
  });
});
