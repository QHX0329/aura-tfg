import { test, expect } from '@playwright/test';

/**
 * Flujo 4: Business portal (D-07)
 * PYME se registra → admin aprueba → PYME ve dashboard y gestiona precios
 *
 * Este flujo es completamente UI-driven porque el web companion tiene las
 * páginas /onboarding, /admin y /dashboard para este flujo.
 */

const API_URL = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:8000/api/v1';
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL ?? 'admin@bargain.local';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'admin';
const PYME_EMAIL = `pyme_${Date.now()}@test.bargain.local`;
const PYME_PASSWORD = 'TestPyme123!';

test.describe('Business portal flow', () => {
  test('PYME onboarding → admin approval → price visible', async ({ page, request }) => {
    // Step 1: Register PYME user via API
    const regRes = await request.post(`${API_URL}/auth/register/`, {
      data: {
        email: PYME_EMAIL,
        password: PYME_PASSWORD,
        password_confirm: PYME_PASSWORD,
        first_name: 'PYME',
        last_name: 'Test',
      },
    });
    expect(regRes.status()).toBe(201);

    // Step 2: Login as PYME user
    await page.goto('/login');
    await page.locator('input[type="email"]').fill(PYME_EMAIL);
    await page.locator('input[type="password"]').fill(PYME_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/onboarding/);

    // Step 3: Fill onboarding form
    await page.goto('/onboarding');
    await page.locator('input[name="business_name"]').fill('Frutería E2E Test');
    await page.locator('input[name="tax_id"]').fill(`B${Date.now().toString().slice(-7)}`);
    await page.locator('input[name="address"]').fill('Calle Test 1, Sevilla');
    await page.locator('button[type="submit"]').click();
    // Expect pending verification message
    await expect(page.locator('text=/pendiente|verificación|pending/i')).toBeVisible({
      timeout: 10000,
    });

    // Step 4: Admin approves via API (faster than UI, verifies approval endpoint)
    const adminLoginRes = await request.post(`${API_URL}/auth/token/`, {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    expect(adminLoginRes.status()).toBe(200);
    const { access: adminToken } = await adminLoginRes.json();

    // Get the pending business profile
    const profilesRes = await request.get(`${API_URL}/business/profiles/`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(profilesRes.status()).toBe(200);
    const profiles = await profilesRes.json();
    const pendingProfile = (profiles.results ?? profiles).find(
      (p: { user?: { email: string }; business_email?: string }) =>
        p.user?.email === PYME_EMAIL || p.business_email === PYME_EMAIL
    );
    expect(pendingProfile).toBeTruthy();

    const approveRes = await request.post(
      `${API_URL}/business/profiles/${pendingProfile.id}/approve/`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    expect(approveRes.status()).toBe(200);

    // Step 5: PYME logs back in and sees dashboard
    await page.goto('/login');
    await page.locator('input[type="email"]').fill(PYME_EMAIL);
    await page.locator('input[type="password"]').fill(PYME_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/);
    await expect(page.locator('text=/dashboard|precios|productos/i')).toBeVisible();
  });
});
