---
status: complete
phase: 02-business-notifications
source: 02-01-SUMMARY.md, 02-02-SUMMARY.md
started: 2026-03-17T00:00:00Z
updated: 2026-03-17T22:00:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 11
name: Push Token Registration
expected: |
  POST /api/v1/notifications/push-token/ con {"token": "ExponentPushToken[xxxx]", "device_id": "device-001"}
  devuelve 201 en la primera llamada.
  Una segunda POST con el mismo device_id (upsert) devuelve 200
  y actualiza el token sin crear un duplicado.
awaiting: complete

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running backend container (`make stop`). Run `make dev`. Container starts without errors, all migrations apply (including `0001_initial` for business + notifications, `0002_store_business_profile`, `0002_user_notify_*`), and GET http://localhost:8000/api/v1/schema/ returns 200. Celery Beat log shows new scheduled tasks (`deactivate_expired_promotions`, `check_competitor_prices`).
result: issue
reported: "ModuleNotFoundError: No module named 'exponent_server_sdk' — celery y celery-beat crasheaban al arrancar"
severity: blocker
fix: "Reconstruir imagen con `docker compose -f docker-compose.dev.yml build --no-cache` — la imagen anterior no tenía el paquete instalado. Tras rebuild todos los servicios arrancan correctamente, todas las tasks se registran (apps.notifications.tasks.dispatch_push_notification, notify_new_promo_at_store, send_shared_list_notification) y celery-beat envía tareas scheduled."
fixed: true

### 2. PYME Registration
expected: POST /api/v1/business/register/ with `{"business_name": "Mi Tienda", "tax_id": "B12345678", "address": "Calle Mayor 1"}` as a user with role=business returns 201. The BusinessProfile is created with `is_verified: false`. A second POST with the same tax_id returns 400 (unique constraint).
result: pass

### 3. Admin Verification — Approve
expected: As admin, POST /api/v1/business/admin/verify/{id}/ returns 200 and sets `is_verified: true` on the BusinessProfile. GET /api/v1/business/profile/ as the business user now shows `is_verified: true`.
result: pass

### 4. Admin Verification — Reject
expected: As admin, POST /api/v1/business/admin/reject/{id}/ with `{"reason": "Documentación incompleta"}` returns 200, sets `is_verified: false`, and stores the rejection reason. GET /api/v1/business/profile/ as the business user shows the rejection_reason text.
result: pass

### 5. Business Price Management
expected: As a verified business user, POST /api/v1/business/prices/ with `{"product": <id>, "store": <id>, "price": 1.99}` returns 201 with `source: "business"`. GET /api/v1/prices/?store=<id> lists the created price. The price never becomes stale (is_stale field stays false).
result: pass

### 6. Promotion Creation and 409 Conflict
expected: As a verified business user, POST /api/v1/business/promotions/ with a valid product+store+discount returns 201. A second POST for the same product+store (both active) returns 409. Deactivating the first (POST /api/v1/business/promotions/{id}/deactivate/) then creating again returns 201.
result: pass

### 7. Promo Price in Comparison
expected: GET /api/v1/prices/compare/?products=<id>&location=<lat,lng> for a product that has an active promotion shows `promo_price` and `promotion` fields in the response alongside the regular `price`. Products without promotions show `promo_price: null`.
result: pass

### 8. Notification Inbox
expected: GET /api/v1/notifications/ returns the list of the user's notifications (only non-deleted). Response includes `id`, `notification_type`, `title`, `body`, `is_read`, `action_url`, `created_at`. GET /api/v1/notifications/unread-count/ returns `{"count": N}`.
result: pass

### 9. Mark Notification as Read
expected: POST /api/v1/notifications/{id}/read/ returns 200 and sets `is_read: true`. POST /api/v1/notifications/read-all/ marks all notifications as read. Subsequent GET /api/v1/notifications/unread-count/ returns `{"count": 0}`.
result: pass

### 10. Soft-Delete Notification
expected: DELETE /api/v1/notifications/{id}/ returns 204. The notification no longer appears in GET /api/v1/notifications/ (filtered by `deleted_at__isnull=True`), but the DB record still exists with `deleted_at` set.
result: pass

### 11. Push Token Registration
expected: POST /api/v1/notifications/push-token/ with `{"token": "ExponentPushToken[xxxx]", "device_id": "device-001"}` returns 201 on first call. A second POST with the same device_id (upsert) returns 200 and updates the token without creating a duplicate.
result: pass

## Summary

total: 11
passed: 9
issues: 2
pending: 0
skipped: 0

## Gaps

- `apps/notifications/admin.py` no existía — Notification y UserPushToken no aparecían en el admin. Creado y `deleted_at`/`created_at` marcados como `readonly_fields`.
- `Notification.data` tenía `default=dict` pero faltaba `blank=True` → campo obligatorio en el admin. Corregido + migración aplicada.
- `BusinessPriceSerializer` no validaba ownership de tienda → seguridad bug. Corregido con `validate()` + test de regresión (ERR-006).
