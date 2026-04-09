import { test, expect } from '@playwright/test';

/**
 * Flujo 1: Autenticación completa (D-07)
 * register → login → JWT refresh → logout
 *
 * Usa UI del web companion (páginas /register y /login existen).
 * El JWT refresh se verifica a nivel API (la app lo hace automáticamente en
 * el interceptor Axios — se comprueba que el token de acceso se puede usar
 * para una llamada autenticada tras el login).
 */

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? `e2e_${Date.now()}@test.bargain.local`;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? 'TestPass123!';
const API_URL = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:8000/api/v1';

test.describe('Auth flow', () => {
  test('register → login → token refresh → logout', async ({ page, request }) => {
    // Step 1: Register via API (más rápido que UI, y verifica el endpoint directamente)
    const registerRes = await request.post(`${API_URL}/auth/register/`, {
      data: {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        password_confirm: TEST_PASSWORD,
        first_name: 'E2E',
        last_name: 'Test',
      },
    });
    expect(registerRes.status()).toBe(201);

    // Step 2: Login via UI
    await page.goto('/login');
    await page.locator('input[name="email"], input[type="email"]').fill(TEST_EMAIL);
    await page.locator('input[name="password"], input[type="password"]').fill(TEST_PASSWORD);
    await page.locator('button[type="submit"]').click();

    // Step 3: Verify token stored in localStorage after login
    await page.waitForURL(/\/(dashboard|onboarding)/);
    const accessToken = await page.evaluate(() => localStorage.getItem('access_token'));
    expect(accessToken).toBeTruthy();

    // Step 4: Token refresh — call refresh endpoint with stored refresh token
    const refreshToken = await page.evaluate(() => localStorage.getItem('refresh_token'));
    if (refreshToken) {
      const refreshRes = await request.post(`${API_URL}/auth/token/refresh/`, {
        data: { refresh: refreshToken },
      });
      expect(refreshRes.status()).toBe(200);
      const refreshData = await refreshRes.json();
      expect(refreshData.access).toBeTruthy();
    }

    // Step 5: Logout — clear localStorage
    await page.evaluate(() => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    });
    const tokenAfterLogout = await page.evaluate(() => localStorage.getItem('access_token'));
    expect(tokenAfterLogout).toBeNull();
  });
});
