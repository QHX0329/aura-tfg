# Phase 1: Core Backend - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Full REST API for users/auth, product catalog, store geosearch, price tracking, and shopping lists. All endpoints consumed by the React Native frontend in Phase 3. No UI work in this phase. Business portal and notifications are Phase 2.

</domain>

<decisions>
## Implementation Decisions

### JWT Session Policy
- Access tokens live **5 minutes**
- Refresh tokens live **30 days**
- Refresh token rotation: **rotate on every use** (old token invalidated, new one issued)
- Multi-device: **both sessions stay active** — each device gets its own independent refresh token
- Password reset: **single-use token link** sent by email, expires after 1 hour
- Email backend: console for dev, SMTP for production (no third-party transactional service)

### Product Search
- Fuzzy search implementation: **pg_trgm trigram similarity** (PostgreSQL native extension, threshold ~0.3)
- Barcode search: **exact match only** — if barcode not in DB, return 404 and suggest crowdsourced entry
- Category hierarchy: **2 levels** (parent + subcategory, e.g., Lácteos > Leche)
- Product autocomplete uses trigram similarity on `normalized_name` field

### Crowdsourcing & Catalog
- New product proposals (PROD-05): **pending admin review** before becoming visible — not immediate publish
- Crowdsourced prices (PRICE-05): **shown alongside scraped prices with lower confidence weight**, never override scraped prices directly. Tagged with `source=crowdsourcing`.

### Price Data Policies
- Price history retention: **90 days** — Celery periodic task purges older records
- Price expiry: **mark stale** (keep in DB with stale flag), never hard delete — preserves history chart integrity
  - Scraped prices: stale after 48h
  - Crowdsourced prices: stale after 24h
- Price alerts (PRICE-04): **Celery periodic task checks every 30 minutes** — scans active alerts against current prices, triggers notification if target met
- Price comparison endpoint (PRICE-01): **filters by user's search radius using PostGIS** — requires user location in request, only returns stores within radius
- Price history chart (PRICE-03): **daily aggregated** (min/max/avg per day) — one data point per day for the 90-day window

### Shopping List Sharing
- Collaboration mode: **full co-edit** — both owner and collaborators can add, remove, and check items
- Invite mechanism: **by username** — user types the other person's registered username
- When collaborator is removed: **their items stay on the list**, only future edit access is revoked
- Templates (LIST-04): **items only** — copies product names, no quantities, no checked state; all items reset to unchecked with quantity=1
- Active list limit: **active = not archived** — at 20 active lists, block creation with HTTP 409 and message "Archiva una lista para crear una nueva"

### Claude's Discretion
- Exact pg_trgm similarity threshold (start at 0.3, tune if needed)
- Loading skeleton and error state UI patterns (backend concerns only here)
- Exact Celery Beat schedule for price stale-marking task
- Admin moderation UI for product approvals (Django admin is sufficient)
- structlog logging format details
- Swagger/OpenAPI schema field descriptions

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `User` model (backend/apps/users/models.py): fully implemented with roles (consumer/business/admin), PostGIS `default_location`, `max_search_radius_km`, `max_stops`, `optimization_preference`, `push_notifications_enabled`. No serializers or views yet.
- `core/exceptions.py`: custom `BargainAPIException` hierarchy established — all new exceptions extend this
- `prices/tasks.py`: Celery task stub exists — add price-stale marking and alert-checking tasks here
- simplejwt: already installed and configured for JWT auth

### Established Patterns
- API response format: `{ "success": true/false, "data": {} }` or `{ "success": false, "error": { "code", "message", "details" } }` — all endpoints must follow this
- Ruff linting enforced (max 99 chars, Google docstrings on public methods, type hints required)
- ViewSets use `select_related`/`prefetch_related` on queryset
- Django admin is the moderation interface — no custom admin UI needed for TFG

### Integration Points
- All 5 apps are skeleton-only (`urls.py` with empty `urlpatterns`, no models/serializers/views) — full implementation needed
- `config/urls.py` already includes app URL namespaces — just add routes to each app's `urls.py`
- PostGIS configured in Docker container — `gis_models.PointField` works directly
- Celery + Redis running — tasks registered in `tasks.py` files per app

</code_context>

<specifics>
## Specific Ideas

- Price comparison result should include "fresh" vs "stale" indicator per price entry so the frontend can show a warning badge
- Shopping list API should return enriched items (product name + category + latest price from nearby store) so the frontend doesn't need N+1 calls
- Password reset emails should work in dev via `EMAIL_BACKEND = django.core.mail.backends.console.EmailBackend`

</specifics>

<deferred>
## Deferred Ideas

- Share list by public link (v2-01) — noted in REQUIREMENTS.md, out of scope for Phase 1
- Open Food Facts API fallback for barcode lookup — mentioned during barcode discussion, could enrich the catalog in a future phase
- Real-time collaborative list sync (WebSocket) — high complexity, not in TFG scope

</deferred>

---

*Phase: 01-core-backend*
*Context gathered: 2026-03-16*
