import { test, expect } from '@playwright/test';

/**
 * Flujo 2: Lista → Optimizar → Ruta (API-level, D-07)
 *
 * El web companion no tiene páginas de consumer (lista/optimizador — son pantallas
 * móviles). Se usa Playwright request fixture para verificar el flujo API completo.
 * Esto cubre la integración backend end-to-end del feature principal del TFG.
 */

const API_URL = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:8000/api/v1';
const TEST_EMAIL = `optimizer_${Date.now()}@test.bargain.local`;
const TEST_PASSWORD = 'TestOpt123!';

test.describe('Optimizer API flow', () => {
  let accessToken: string;
  let listId: number;

  test.beforeAll(async ({ request }) => {
    // Register and login
    await request.post(`${API_URL}/auth/register/`, {
      data: {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        password_confirm: TEST_PASSWORD,
        first_name: 'Opt',
        last_name: 'Test',
      },
    });
    const loginRes = await request.post(`${API_URL}/auth/token/`, {
      data: { email: TEST_EMAIL, password: TEST_PASSWORD },
    });
    const loginData = await loginRes.json();
    accessToken = loginData.access;
  });

  test('crear lista con items → optimizar → resultado con ruta', async ({ request }) => {
    const headers = { Authorization: `Bearer ${accessToken}` };

    // Step 1: Create shopping list
    const listRes = await request.post(`${API_URL}/shopping-lists/`, {
      headers,
      data: { name: 'Lista E2E Optimizer' },
    });
    expect(listRes.status()).toBe(201);
    const listData = await listRes.json();
    listId = listData.id;

    // Step 2: Add items to list
    const item1 = await request.post(`${API_URL}/shopping-lists/${listId}/items/`, {
      headers,
      data: { name: 'leche', quantity: 2 },
    });
    expect(item1.status()).toBe(201);

    const item2 = await request.post(`${API_URL}/shopping-lists/${listId}/items/`, {
      headers,
      data: { name: 'pan', quantity: 1 },
    });
    expect(item2.status()).toBe(201);

    // Step 3: Launch optimization
    const optimizeRes = await request.post(`${API_URL}/optimizer/optimize/`, {
      headers,
      data: {
        shopping_list_id: listId,
        user_location: { lat: 37.3891, lng: -5.9844 }, // Sevilla centro
        max_distance_km: 5,
        optimization_mode: 'balanced',
      },
    });
    // Accept 200 (result ready) or 202 (async task started)
    expect([200, 202]).toContain(optimizeRes.status());

    const optimizeData = await optimizeRes.json();
    // Verify response has required fields
    expect(optimizeData).toHaveProperty('success');

    if (optimizeRes.status() === 200) {
      // Synchronous result
      const result = optimizeData.data ?? optimizeData;
      expect(result).toHaveProperty('total_price');
      expect(result).toHaveProperty('route_data');
    }
    // 202 means Celery task queued — valid for staging with async workers
  });
});
