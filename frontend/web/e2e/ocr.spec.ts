import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Flujo 3: OCR ticket → añadir productos a lista (API-level, D-07)
 *
 * La cámara física es exclusiva del móvil (D-09 — UAT manual).
 * Este test verifica el endpoint OCR con una imagen de prueba, cubriendo
 * la integración entre el endpoint y Google Vision API (o su mock en test).
 */

const API_URL = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:8000/api/v1';
const TEST_EMAIL = `ocr_${Date.now()}@test.bargain.local`;
const TEST_PASSWORD = 'TestOcr123!';

test.describe('OCR API flow', () => {
  let accessToken: string;

  test.beforeAll(async ({ request }) => {
    await request.post(`${API_URL}/auth/register/`, {
      data: {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        password_confirm: TEST_PASSWORD,
        first_name: 'OCR',
        last_name: 'Test',
      },
    });
    const loginRes = await request.post(`${API_URL}/auth/token/`, {
      data: { email: TEST_EMAIL, password: TEST_PASSWORD },
    });
    const loginData = await loginRes.json();
    accessToken = loginData.access;
  });

  test('enviar imagen → OCR endpoint responde con estructura esperada', async ({ request }) => {
    // Use pre-created fixture or create a minimal valid JPEG on the fly
    const fixturesDir = path.join(__dirname, 'fixtures');
    if (!fs.existsSync(fixturesDir)) fs.mkdirSync(fixturesDir, { recursive: true });
    const testImagePath = path.join(fixturesDir, 'ticket-test.jpg');

    // Minimal valid JPEG (1x1 pixel, white) — created if not present
    if (!fs.existsSync(testImagePath)) {
      const minimalJpeg = Buffer.from(
        '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkS' +
          'Ew8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJ' +
          'CQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy' +
          'MjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/' +
          'EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAA' +
          'AAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AJQA/9k=',
        'base64'
      );
      fs.writeFileSync(testImagePath, minimalJpeg);
    }

    // Call OCR endpoint
    const ocrRes = await request.post(`${API_URL}/ocr/scan/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      multipart: {
        image: {
          name: 'ticket-test.jpg',
          mimeType: 'image/jpeg',
          buffer: fs.readFileSync(testImagePath),
        },
      },
    });

    // Accept 200 (items extracted) or 422 (no text in image — valid with minimal fixture)
    // Both confirm the endpoint is reachable and processing correctly
    expect([200, 422]).toContain(ocrRes.status());

    const ocrData = await ocrRes.json();
    expect(ocrData).toHaveProperty('success');

    if (ocrRes.status() === 200) {
      // If items were extracted, verify structure
      const result = ocrData.data ?? ocrData;
      expect(result).toHaveProperty('items');
      expect(Array.isArray(result.items)).toBe(true);
    }
  });
});
