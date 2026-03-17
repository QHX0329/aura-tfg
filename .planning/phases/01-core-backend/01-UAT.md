---
status: testing
phase: 01-core-backend
source: 01-01-SUMMARY.md, 01-02-SUMMARY.md, 01-03-SUMMARY.md, 01-04-SUMMARY.md, 01-05-SUMMARY.md, 01-06-SUMMARY.md
started: 2026-03-16T22:00:00Z
updated: 2026-03-16T22:00:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

status: complete

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running backend container. Run `make dev` (or `docker-compose -f docker-compose.dev.yml up`). Container starts without errors, all migrations apply (including pg_trgm extension, PostGIS spatial index), and GET http://localhost:8000/api/v1/schema/ returns a JSON response (200 OK).
result: pass
note: Schema returns 200 55629 bytes. drf-spectacular warnings present (views without serializer_class) but not functional failures.

### 2. User Registration
expected: POST http://localhost:8000/api/v1/auth/register/ with `{"username":"test","email":"test@example.com","password":"pass1234"}` returns 201 with `{"success": true, "data": {...}}`. Duplicate email on second attempt returns 400.
result: pass

### 3. JWT Login & Token Refresh
expected: POST /api/v1/auth/token/ with valid credentials returns `{"success": true, "data": {"access": "...", "refresh": "..."}}`. POST /api/v1/auth/token/refresh/ with the refresh token returns a new access token (rotation).
result: pass

### 4. Password Reset (anti-enumeration)
expected: POST /api/v1/auth/password-reset/ with any email (including non-existent) always returns 200 with `{"success": true}` — never reveals whether the email exists.
result: pass

### 5. User Profile
expected: GET /api/v1/auth/profile/me/ with Bearer token returns user profile. PATCH with `{"phone": "+34600000000"}` updates the field and returns 200 with updated data.
result: pass

### 6. Product Fuzzy Search
expected: GET /api/v1/products/?q=leche returns products matching "leche" ordered by trigram similarity. GET /api/v1/products/ with no filters returns empty list (no full-catalog dump).
result: pass

### 7. Product Barcode Lookup & Category Filter
expected: GET /api/v1/products/?barcode=<valid_ean> returns the matching product. GET /api/v1/products/?barcode=0000000000 returns 404 with `{"success": false, "error": {"code": "PRODUCT_NOT_FOUND", ...}}`. GET /api/v1/products/?category=<id> returns products filtered by that category.
result: pass

### 8. Product Autocomplete & Category Tree
expected: GET /api/v1/products/autocomplete/?q=lec returns up to 10 products ordered by similarity (lower threshold — short partial terms work). GET /api/v1/products/categories/ returns array of categories with nested `children` field (2-level tree, no pagination).
result: pass

### 9. Store Radius Search & Favorites
expected: GET /api/v1/stores/?lat=37.38&lng=-5.99&radius_km=5 returns stores within 5 km ordered by `distance_km`. GET /api/v1/stores/ without lat/lng returns 400 MISSING_LOCATION. POST /api/v1/stores/{id}/favorite/ (authenticated, no lat/lng needed) toggles favorite; second call removes it.
result: pass

### 10. Price Compare & History
expected: GET /api/v1/prices/compare/?product=<id>&lat=37.38&lng=-5.99 returns prices for that product across nearby stores, each with `is_stale` and `distance_km`. GET /api/v1/prices/<product_id>/history/ returns daily `min/max/avg` aggregations for up to 90 days.
result: pass

### 11. Shopping List CRUD & 20-list limit
expected: POST /api/v1/lists/ creates a list. GET /api/v1/lists/ returns only the authenticated user's lists. PATCH /api/v1/lists/{id}/ with `{"is_archived": true}` archives it. Creating a 21st active list returns 409 with "Archiva una lista para crear una nueva".
result: pass

### 12. Shopping List Items (enriched)
expected: POST /api/v1/lists/{id}/items/ adds a product item. GET /api/v1/lists/{id}/items/ returns enriched items with `product_name`, `category_name`, `latest_price` (null if no prices yet), `is_stale`. PATCH /api/v1/lists/{id}/items/{pk}/ updates quantity. DELETE removes the item.
result: pass

### 13. Shopping List Collaborators & Templates
expected: POST /api/v1/lists/{id}/collaborators/ with `{"username": "other_user"}` invites collaborator who can then CRUD items. POST /api/v1/lists/{id}/save-template/ saves a reusable template. POST /api/v1/lists/from-template/{template_pk}/ creates a new list from template.
result: pass

### 14. Price Alerts & List Total
expected: POST /api/v1/prices/alerts/ creates a price alert. DELETE /api/v1/prices/alerts/{id}/ deactivates it (returns 200/204, record still exists in DB with is_active=False). GET /api/v1/prices/list-total/?list=<id>&store=<id> returns `total_price` and `missing_items` for products not available at that store.
result: pass

### 15. API Documentation
expected: GET /api/v1/schema/ returns OpenAPI JSON (200). GET /api/v1/schema/swagger-ui/ renders Swagger UI HTML page. GET /api/v1/schema/redoc/ renders ReDoc HTML page.
result: pass

## Summary

total: 15
passed: 15
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
