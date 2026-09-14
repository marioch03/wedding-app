import { test, expect } from '@playwright/test';
import { mockWeddingData, mockEventsData } from './fixtures/guestData';

test.describe('Experiencia del Invitado - Landing Page Pública', () => {
  test.beforeEach(async ({ page }) => {
    // Interceptar llamadas públicas a la API para tests deterministas
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

  test('El invitado visualiza la portada con los nombres de la pareja y la cuenta atrás', async ({ page }) => {
    await page.goto('/');

    // Verificar que los nombres de los novios aparecen en la cabecera / hero
    await expect(page.getByText('Elena', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Alejandro', { exact: true }).first()).toBeVisible();

    // Verificar el subtítulo del hero
    await expect(page.getByText('Nos casamos y queremos celebrarlo contigo')).toBeVisible();

    // Verificar el título de la pestaña del navegador
    await expect(page).toHaveTitle(/Elena & Alejandro/);
  });

  test('El invitado puede navegar y consultar la historia y el itinerario de eventos', async ({ page }) => {
    await page.goto('/');

    // Verificar sección de historia
    await expect(page.getByRole('heading', { name: 'Nuestra Historia' })).toBeVisible();

    // Verificar eventos en el cronograma
    await expect(page.getByText('Ceremonia Civil')).toBeVisible();
    await expect(page.getByText('Banquete & Fiesta')).toBeVisible();

    // Verificar las ubicaciones de los eventos
    await expect(page.getByText('Jardines del Palacete').first()).toBeVisible();
    await expect(page.getByText('Invernadero de Cristal', { exact: true })).toBeVisible();

    // Verificar alojamientos y preguntas frecuentes
    await expect(page.getByText('Hotel Rural La Casona')).toBeVisible();
    await expect(page.getByText('¿Hay transporte organizado?')).toBeVisible();
  });

  test('El botón de confirmación en la portada redirige a la página de RSVP', async ({ page }) => {
    await page.goto('/');

    // Hacer clic en "Confirmar Asistencia" en la portada
    const rsvpButton = page.locator('a:has-text("Confirmar Asistencia")').first();
    await expect(rsvpButton).toBeVisible();
    await rsvpButton.click();

    // Verificar que la URL es /rsvp
    await expect(page).toHaveURL(/\/rsvp$/);
  });
});
