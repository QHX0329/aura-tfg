# Phase 2: Business & Notifications - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

PYME businesses can register, get admin-verified, and manage their store prices and promotions via a portal API. Users receive event-driven push and email notifications (price alerts, new promos at favorited stores, shared list changes). No frontend screens in this phase — that's Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Business Profile & Verification
- **1:N model**: one `BusinessProfile` can own multiple `Store` branches (FK on BusinessProfile)
- Profile fields: business name, tax ID (CIF/NIF), address, website (beyond User model)
- Business always creates a **new Store** on registration — no claiming existing scraped chain stores
- **Verification via dedicated admin API endpoint** (not Django admin toggle): approve/reject actions on BusinessProfile viewset
- Rejection **includes a reason string**; business can edit profile and re-submit for re-verification
- **Blocked until verified**: unverified businesses get HTTP 403 on all write operations (price updates, promotions); read access to own profile is fine
- **Email sent on approval and rejection** — uses existing console/SMTP email backend from Phase 1

### Promotion Model
- Discount types: **both flat (€) and percentage (%)** — `discount_type` field ('flat'/'percentage') + `discount_value`
- Scope: **product-level** — Promotion has FKs to product + store; requires an existing Price record at that store
- Active promotions appear in price comparison response as a **`promo_price` field** alongside regular price (consistent with existing `offer_price` shape)
- **Auto-deactivate via Celery task** when `end_date` passes (consistent with Celery patterns established in Phase 1)
- **Optional `min_quantity` field** (nullable) — discount applies only when buying that quantity
- **Basic view count** (`views` integer) on Promotion model — incremented when included in a price comparison response
- **No overlapping promotions**: unique constraint enforces only one active promotion per product+store at a time
- **Optional `title` + `description` fields** — visible to consumers as a badge/label in price comparison
- **Both business and admin can deactivate** a promotion; business via portal API, admin via the same dedicated admin API endpoint

### Business Prices
- Business price updates create a **new Price record with `source='business'`** — adds 'business' to `Price.Source` choices
- **No expiry** — business prices never go stale automatically; business is responsible for keeping them current
- **Business price takes priority** over scraped when both exist for the same product+store — scraped shown as 'last known' context
- Business can only enter prices for **products already in the catalog** — must use PROD-05 crowdsourcing flow if product doesn't exist
- **Read-only pricing history** available to businesses: `GET /business/prices/?store=X` lists their past Price records (prices never hard-deleted per Phase 1 decision)
- **Competitor price alert to business**: Celery task alerts the business (email) when a scraped price for one of their products differs by more than the threshold
  - Default threshold: **10%**, configurable per BusinessProfile (`price_alert_threshold_pct` field)

### Notification Granularity & Storage
- **Per-event preferences** added to User model (nullable booleans, default True):
  - `notify_price_alerts` — user's own price alert triggered
  - `notify_new_promos` — new promotion at a favorited store
  - `notify_shared_list_changes` — collaborator changes a shared list
  - Global `push_notifications_enabled` / `email_notifications_enabled` act as master off-switches
- **Expo Push Notifications** for push (natural fit with React Native + Expo frontend)
- **`UserPushToken` model** (separate table): user FK, token, device_id, created_at — supports multiple devices per user; token upserted on each app launch via a registration endpoint
- **All notification dispatch is async via Celery** — never blocks the API response

### Notification Events (NOTIF-01)
- **Price alert triggered** — dispatched by existing Celery task (Phase 1); just add notification dispatch call
- **New promo at favorited store** — triggered when a Promotion is created/activated
- **Shared list changed** — **batched**: changes within a 15-minute window are summarized into one notification per user (Celery delayed task per list)
- **Business registration approved/rejected** — email to the business user

### Notification Model (in-app inbox)
- Persist all notifications in DB with full model:
  - `user` (FK), `notification_type` (TextChoices), `title`, `body`, `is_read` (default False)
  - `data` (JSONField) — event-specific payload (e.g., `{"list_id": 42}`)
  - `action_url` — deep link string using `bargain://` scheme (e.g., `bargain://lists/42`, `bargain://products/18/prices`)
  - `created_at`, `deleted_at` (nullable — soft delete)
- Inbox endpoint: `GET /notifications/` returns items WHERE `deleted_at IS NULL`, ordered by `created_at DESC`
- `PATCH /notifications/{id}/read/` marks as read; `DELETE /notifications/{id}/` sets `deleted_at`
- **Push rate limit**: max 10 push notifications per user per day, tracked in Redis; email not rate-limited

### Claude's Discretion
- Exact Celery Beat schedule for promotion auto-deactivation task
- Deep link scheme routing on the React Native side (Phase 3 concern)
- Exact batching implementation for shared-list notifications (Celery countdown vs ETA)
- Redis key structure for push rate limiting
- Email template design for approval/rejection messages

</decisions>

<specifics>
## Specific Ideas

- The business competitor price alert (>10% scraped vs. business) mirrors the Phase 1 price alert UX for consumers — same Celery task pattern, different audience
- Action URLs use `bargain://` scheme with entity paths; the Notification model stores the full URL so the frontend can navigate without knowing the notification type
- Shared list batch window is 15 minutes — wide enough to group burst edits, short enough to feel timely

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `User` model (`users/models.py`): already has `role='business'`, `push_notifications_enabled`, `email_notifications_enabled` — no new User fields for global prefs, only per-event fields added
- `Price` model (`prices/models.py`): `source` TextChoices field — extend with `BUSINESS = "business"`, `"Portal PYME"` choice
- `Store` model (`stores/models.py`): `is_local_business` boolean already present — business-owned stores will set this to True on creation
- `core/exceptions.py`: `BargainAPIException` hierarchy — add `BusinessNotVerifiedError`, `PromotionConflictError`
- `prices/tasks.py`: Celery task stubs exist — add promotion auto-deactivation task and business competitor price alert task here
- Celery + Redis already running — delayed tasks (ETA countdown) available for batched notifications

### Established Patterns
- API response format: `{"success": true/false, "data": {}}` — all new endpoints must follow this
- ViewSets use `select_related`/`prefetch_related` on queryset
- Django admin is moderation interface for simple cases; dedicated API actions for verification flow
- Prices never hard-deleted — business prices follow the same rule

### Integration Points
- `business/` and `notifications/` apps are skeleton-only — `urls.py` with empty urlpatterns, no models/serializers/views
- `config/urls.py` already includes app URL namespaces — add routes to each app's `urls.py`
- `stores/models.py` Store model needs a `business_profile` FK (nullable) to link business-owned stores
- `prices/serializers.py` PriceComparisonSerializer needs `promo_price` and `promotion` fields added
- `shopping_lists/views.py` item add/remove/check actions need a post-save hook to trigger the batched notification task

</code_context>

<deferred>
## Deferred Ideas

- In-app notification center UI — Phase 3 (frontend screens)
- Push notification analytics (open rates, tap rates) — future phase or v2
- Business dashboard statistics (views, clicks on promotions) beyond basic view count — Phase 3 portal screen
- Promotion types beyond flat/percentage (e.g., bundle deals, loyalty points) — v2
- Business can claim an existing scraped Store record — v2 (requires admin approval per claim)

</deferred>

---

*Phase: 02-business-notifications*
*Context gathered: 2026-03-17*
