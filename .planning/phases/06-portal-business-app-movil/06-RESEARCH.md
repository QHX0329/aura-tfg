# Phase 6: Portal Business y App Movil - Research

**Researched:** 2026-04-05
**Domain:** Django DRF integration tests, React Native / Ant Design web portal, end-to-end product proposal flow
**Confidence:** HIGH

## Summary

Phase 6 is a closure and polish phase. The majority of backend code is already implemented: `ProductProposalAdminViewSet` (approve/reject), `BusinessPriceViewSet` (bulk_update), `BusinessProfileViewSet` (approve/reject), and the `ProductProposalSerializer`. The mobile screen (`ProductProposalScreen`) and the admin web panel (`AdminApprovalPage`) also exist. The phase goal is to verify correctness, unify divergent logic, write integration tests for the proposal flow, and close the E2E chain so a mobile proposal becomes a visible product and price in the portal.

The primary gap identified is the **test gap** on the proposals admin endpoints — no existing test covers `POST /products/proposals/admin/{id}/approve/` or reject. A secondary gap is **logic divergence** between `admin.py` (Django admin bulk approve action) and the API `approve` action: the admin action uses `Price.objects.create` (always new) and `source=BUSINESS`, while the API view uses `Price.objects.update_or_create` with `source=CROWDSOURCING`. These must be reconciled by extracting shared logic to `backend/apps/products/services.py`.

A third gap is the `category_id` field on `PATCH /products/{id}/`: `ProductListSerializer` already exposes `category_id` as a write-only PrimaryKeyRelatedField, so PATCH with `category_id` should already work — this needs a quick verification test rather than new code. The CSV bulk-update flow in `PricesPage.tsx` uses `product` (int PK) and `store` (int PK), which matches `BulkPriceItemSerializer` exactly.

**Primary recommendation:** Write 5-6 targeted integration tests for the proposal flow and bulk price flow, extract the proposal approval logic to a service, then run a UAT pass. No major backend or frontend rewrites are needed.

## Project Constraints (from CLAUDE.md)

- Backend: Django 5.x, Python 3.12+, pytest + pytest-django, coverage >= 80%, Ruff linter
- Frontend mobile: React Native + Expo, ESLint + Prettier
- Frontend web: Vite + React + Ant Design in `frontend/web/src/`
- Commits: Conventional Commits in Spanish with task ID, e.g. `feat(products): descripcion (F6-XX)`
- Tests run inside Docker container: `make test-backend` or `cd backend && pytest`
- Type hints mandatory on all public functions (Python)
- API responses always use `{ success, data/error }` envelope from `apps.core.responses`

## Standard Stack

### Core (already installed — no new dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| pytest-django | installed | Integration tests | Project standard |
| factory_boy | installed | Test fixtures | Used throughout backend/tests/factories.py |
| DRF APIClient | installed | HTTP test client | Used in all integration tests |
| Ant Design | installed | Web portal UI | Project standard for web |
| React Native | installed | Mobile UI | Project standard for mobile |

### No new packages needed
This phase closes existing code and writes tests. No new library installations required.

## Architecture Patterns

### Recommended Project Structure (additions for Phase 6)
```
backend/
├── apps/products/
│   └── services.py          # NEW: extract approve_proposal() shared logic
├── tests/integration/
│   └── test_proposal_admin.py  # NEW: proposal approve/reject integration tests
│   └── test_bulk_prices.py     # NEW (or extend test_business_prices.py): bulk-update tests
frontend/web/src/pages/
│   (no structural changes — fix logic in existing files)
frontend/src/screens/home/
│   (ProductProposalScreen.tsx already exists and is wired)
```

### Pattern 1: Service Extraction for Shared Business Logic
**What:** Move the proposal approval logic from both `admin.py` and `views.py` into a single `apps/products/services.py` function.
**When to use:** When the same operation is performed in two places (API endpoint and Django admin action) and the two implementations have diverged.
**Example:**
```python
# backend/apps/products/services.py
from django.db import transaction
from django.utils import timezone

def approve_proposal(proposal) -> "Product":
    """Aprueba una propuesta: crea Product y Price en una transacción atómica.
    
    Returns:
        Product: el producto creado o recuperado.
    Raises:
        IntegrityError: si hay conflicto irrecuperable de clave única.
    """
    from apps.prices.models import Price

    with transaction.atomic():
        barcode = proposal.barcode or None
        if barcode:
            product, _ = Product.objects.get_or_create(
                barcode=barcode,
                defaults=dict(
                    name=proposal.name,
                    brand=proposal.brand,
                    category=proposal.category,
                    image_url=proposal.image_url,
                    is_active=True,
                ),
            )
        else:
            product = Product.objects.create(
                name=proposal.name,
                brand=proposal.brand,
                barcode=None,
                category=proposal.category,
                image_url=proposal.image_url,
                is_active=True,
            )

        if proposal.price is not None and proposal.store is not None:
            Price.objects.update_or_create(
                product=product,
                store=proposal.store,
                source=Price.Source.CROWDSOURCING,
                defaults={
                    "price": proposal.price,
                    "unit_price": proposal.unit_price,
                    "is_stale": False,
                    "verified_at": timezone.now(),
                },
            )

        proposal.status = ProductProposal.Status.APPROVED
        proposal.save(update_fields=["status"])

    return product
```

### Pattern 2: Integration Test for Proposal Admin (follows existing pattern)
**What:** Standard Django DB test using `admin_client` fixture and DRF APIClient.
**When to use:** For testing approve/reject endpoints that require `is_staff=True`.
```python
# backend/tests/integration/test_proposal_admin.py
@pytest.mark.django_db
class TestProposalAdminApprove:
    def test_admin_can_approve_proposal_creates_product_and_price(
        self, admin_client, pending_proposal_with_price
    ):
        proposal = pending_proposal_with_price
        response = admin_client.post(
            f"/api/v1/products/proposals/admin/{proposal.id}/approve/"
        )
        assert response.status_code == 200
        from apps.products.models import Product
        from apps.prices.models import Price
        assert Product.objects.filter(name=proposal.name).exists()
        assert Price.objects.filter(store=proposal.store).exists()
        proposal.refresh_from_db()
        assert proposal.status == "approved"
```

### Pattern 3: Bulk Price CSV Test (extends existing test_business_prices.py)
**What:** POST a list payload to `/api/v1/business/prices/bulk-update/` and assert created/updated/errors.
```python
def test_bulk_update_partial_errors_returns_partial_success(
    self, api_client, verified_business_user, business_store, product
):
    api_client.force_authenticate(user=verified_business_user)
    payload = [
        {"product": product.id, "store": business_store.id, "price": "2.50"},   # valid
        {"product": 9999999, "store": business_store.id, "price": "1.00"},       # invalid product
        {"product": product.id, "store": 9999999, "price": "3.00"},              # invalid store
    ]
    response = api_client.post(
        "/api/v1/business/prices/bulk-update/",
        data=payload,
        format="json",
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["created"] == 1
    assert len(data["errors"]) == 2
```

### Anti-Patterns to Avoid
- **Calling transaction.atomic() inside admin action without try/except:** The Django admin action currently has no transaction boundary and does `continue` on IntegrityError per item. This is correct behavior but differs from the API; do not add a single wrapping `atomic()` that would roll back all items on one error.
- **Using `window.location.reload()` in React:** `ProductsUploadPage.tsx` calls `window.location.reload()` after editing a product. This is acceptable short-term but the planner should note it as a known smell (not a blocking bug for F6).
- **Hard-coding `source=BUSINESS` in proposal approval:** The API view correctly uses `CROWDSOURCING` for proposals. The admin action uses `BUSINESS`. They must converge on `CROWDSOURCING` since proposals come from crowd users, not from PYME portals.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| EAN-13 validation | Custom regex | `validateEAN13()` already in `ProductsUploadPage.tsx` and `ProductProposalScreen.tsx` | Both implementations are identical — extract to a shared util if reuse is needed, otherwise both are already correct |
| Atomic Product+Price creation | New transaction logic | `approve_proposal()` service (to be extracted from existing `views.py`) | Logic already correct in API view; just extract to avoid duplication |
| Bulk CSV parsing | New parser | Existing `handleCsvImport` in `PricesPage.tsx` is complete and correct | Already handles header mapping, `product`/`store` int PKs, partial errors |
| Admin route protection | Custom auth | `IsAdminUser` permission class already used on `ProductProposalAdminViewSet` | DRF standard — no custom logic needed |

**Key insight:** Phase 6 is integration work, not new feature work. Most of the building blocks already exist in the correct form — the value is in wiring verification, logic unification, and test coverage.

## Divergence Analysis: admin.py vs API views.py

This is the most important technical finding for the planner.

| Aspect | `admin.py` `approve_proposals` | `views.py` `approve()` |
|--------|-------------------------------|------------------------|
| Transaction | None (bare for-loop, continue on error) | `transaction.atomic()` around full operation |
| Barcode conflict | `filter().first()` (returns None, then creates — may still hit IntegrityError) | `get_or_create()` — idempotent |
| Price source | `Price.Source.BUSINESS` | `Price.Source.CROWDSOURCING` |
| Price strategy | `update(is_stale=True)` + `create()` (two queries) | `update_or_create()` (one query) |
| Status save | `proposal.save()` (full save) | `proposal.save(update_fields=["status"])` (targeted) |
| Return | None (admin message) | `success_response({"proposal_id", "product"})` |

**Resolution:** Extract the canonical logic from `views.py` into `apps/products/services.py`. Update `admin.py` to call the service. The canonical source field for proposals is `CROWDSOURCING`.

## Common Pitfalls

### Pitfall 1: Non-Admin accessing proposals/admin endpoint
**What goes wrong:** Authenticated non-admin users receive 403 but the error may not propagate cleanly in the frontend if `AdminApprovalPage` doesn't distinguish 403 from network errors.
**Why it happens:** `ProductProposalAdminViewSet` uses `IsAdminUser` which checks `is_staff=True`, not just a role field.
**How to avoid:** Tests should assert non-admin 403 for both approve and reject. The frontend already has a `forbidden` state guard.
**Warning signs:** Frontend shows blank panel instead of access denied alert.

### Pitfall 2: CSV bulk-update sends product/store as strings
**What goes wrong:** `PricesPage.tsx handleCsvImport()` uses `Number(r['product_id'] || r['product'])` — if the CSV has non-numeric product IDs, `Number()` returns `NaN`, then `|| undefined` kicks in, and the row is silently filtered by `.filter((r) => r.product && r.store && r.price)`.
**Why it happens:** `BulkPriceItemSerializer` expects `PrimaryKeyRelatedField` integers — sending a string would fail DRF validation and generate an error entry.
**How to avoid:** The filtering before POST is correct. Document that the CSV must use integer PKs in the `product_id` and `store_id` columns. The backend will add an error entry per invalid row — verify the error entry has a useful message (currently: `serializer.errors` dict).

### Pitfall 3: Proposals without price/store get approved but no Price is created
**What goes wrong:** `approve()` conditionally creates a Price only when `proposal.price is not None and proposal.store is not None`. If the proposal was submitted without a price (e.g., from `ProductsUploadPage.tsx` "Archivo" tab without a price column), no Price is created, which is correct — but the admin UI doesn't surface this fact.
**Why it happens:** Price is optional in the proposal model.
**How to avoid:** The admin UI (`AdminApprovalPage`) shows the price column — a dash (`—`) already renders when `price` is null. No code change needed; just document in the UAT checklist that price-less proposals produce a Product but no Price.

### Pitfall 4: Double-loading proposals/admin from AdminApprovalPage
**What goes wrong:** `AdminApprovalPage` fetches `/products/proposals/admin/?status=pending` — this hits `ProductProposalAdminViewSet.get_queryset()` which defaults to `status=pending`. This is correct. But `fetchProfiles` queries `/business/profiles/?is_verified=false` — the backend `get_queryset()` for `BusinessProfileViewSet` does NOT filter by `is_verified` in the queryset; it returns all profiles for admin. The frontend does a client-side filter: `.filter((p) => !p.is_verified)`. This is a minor inefficiency but not a bug.
**How to avoid:** Note the discrepancy — not blocking for F6 but can be improved in F7.

### Pitfall 5: `category_id` PATCH — serializer accepts it but model update may silently skip
**What goes wrong:** `ProductsUploadPage.tsx handleEditSubmit()` sends `PATCH /products/{id}/` with `category_id` as a key. `ProductListSerializer` has `category_id` as a `write_only=True` PrimaryKeyRelatedField sourced from `category`. This is the DRF standard pattern and should work. But `ProductViewSet.get_permissions()` for non-safe methods requires `IsVerifiedBusiness`. A non-business authenticated user calling PATCH will receive 403.
**How to avoid:** Verify with a test that `PATCH /products/{id}/` with `category_id` from a verified business user returns 200 and updates the product's category.

## Code Examples

### Verified: approve endpoint response shape (from views.py line 250)
```python
# Source: backend/apps/products/views.py
return success_response(
    {"proposal_id": proposal.id, "product": ProductDetailSerializer(product).data}
)
```

### Verified: bulk_update error shape (from views.py line 362)
```python
# Source: backend/apps/business/views.py
errors.append({"index": idx, "errors": serializer.errors})
# or
errors.append({"index": idx, "errors": {"store": "Tienda no pertenece a tu negocio."}})
```

### Verified: BulkPriceItemSerializer fields (from business/serializers.py)
```python
# Source: backend/apps/business/serializers.py
product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
store = serializers.PrimaryKeyRelatedField(queryset=Store.objects.all())
price = serializers.DecimalField(max_digits=10, decimal_places=2)
```

### Verified: conftest.py admin_client fixture
```python
# Source: backend/tests/conftest.py
@pytest.fixture
def admin_client(api_client, admin_user) -> APIClient:
    api_client.force_authenticate(user=admin_user)
    return api_client
```

### Verified: ProductProposal model fields that drive approve logic
```python
# Source: backend/apps/products/models.py
price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
unit_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
store = models.ForeignKey("stores.Store", null=True, blank=True, ...)
barcode = models.CharField(max_length=20, blank=True)  # NOTE: blank=True, not null=True
```

### Verified: ProductProposalScreen navigation entry (already wired)
```tsx
// Source: frontend/src/navigation/MainTabs.tsx line 106-109
<HomeStack.Screen
  name="ProductProposal"
  component={ProductProposalScreen}
  options={{ headerShown: false }}
/>
```

### Verified: Navigation to ProductProposal from catalog
```tsx
// Source: frontend/src/screens/home/ProductsCatalogScreen.tsx line 997
onPress={() => (navigation as any).navigate("ProductProposal")}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate Price.create in admin.py | update_or_create in API view | Already diverged | Source of inconsistency — must unify |
| No test for proposals/admin | Tests needed | Phase 6 | 0% coverage on approve/reject endpoint |
| window.location.reload() in ProductsUploadPage | Should use React state refresh | Currently present | Minor UX smell, not blocking |

**Deprecated/outdated:**
- `admin.py approve_proposals` action with `source=BUSINESS`: Will be replaced by service call with `source=CROWDSOURCING`
- `Price.objects.filter().update(is_stale=True)` + `create()` pattern: Replaced by `update_or_create()` in the service

## Open Questions

1. **Notification on proposal approval**
   - What we know: `notifications/tasks.py` has `dispatch_push_notification` and `send_shared_list_notification`; `business/tasks.py` has `send_business_approval_email`
   - What's unclear: Should approving a proposal notify the proposing user? The API view does not currently call any notification task after approving.
   - Recommendation: Add a `dispatch_push_notification.delay(proposal.proposed_by_id, ...)` call inside `approve()` as an optional enhancement. Mark as LOW priority — not blocking UAT.

2. **ProductsUploadPage separation**
   - What we know: The page currently has "proponer producto" (POST /products/proposals/) and "editar catálogo global" (PATCH /products/{id}/) on the same page with different tabs.
   - What's unclear: The phase description says "separar proponer producto de editar catálogo global" — this may mean a UI refactor (new tab/section) or a route split.
   - Recommendation: Keep on same page but add a clear visual separator and a banner clarifying that "editar catálogo" affects all stores. No route split needed for F6.

3. **UAT coverage for shared lists**
   - What we know: `send_shared_list_notification` is implemented and tested in `test_notification_events.py`.
   - What's unclear: Whether the UAT checklist for F6 should include shared list verification.
   - Recommendation: Include a smoke check in the UAT script — create a shared list, add a product, verify the collaborator receives the notification entry.

## Environment Availability

Step 2.6: SKIPPED for test-writing tasks (no new external dependencies). All required tools are already available in Docker:
- pytest: available in Docker backend container
- PostgreSQL + PostGIS: running via `make dev`
- Redis: running via `make dev`

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | pytest 8.x + pytest-django |
| Config file | `backend/pytest.ini` |
| Quick run command | `docker exec bargain-backend pytest tests/integration/test_proposal_admin.py -v --tb=short` |
| Full suite command | `make test-backend` |

### Phase Requirements to Test Map
| Req | Behavior | Test Type | Automated Command | File Exists? |
|-----|----------|-----------|-------------------|-------------|
| PRO-01 | Admin approve creates Product + Price in DB | integration | `pytest tests/integration/test_proposal_admin.py::TestProposalAdminApprove::test_admin_can_approve_proposal_creates_product_and_price` | No — Wave 0 |
| PRO-02 | Admin reject updates status + notes | integration | `pytest tests/integration/test_proposal_admin.py::TestProposalAdminApprove::test_admin_can_reject_proposal_with_reason` | No — Wave 0 |
| PRO-03 | Non-admin cannot approve/reject | integration | `pytest tests/integration/test_proposal_admin.py::TestProposalAdminApprove::test_non_admin_cannot_approve` | No — Wave 0 |
| PRO-04 | Approve already-approved proposal returns 400 | integration | `pytest tests/integration/test_proposal_admin.py::test_approve_already_approved_returns_400` | No — Wave 0 |
| BULK-01 | Valid CSV rows create/update prices | integration | `pytest tests/integration/test_business_prices.py::TestBulkUpdate::test_bulk_update_partial_errors` | No — Wave 0 |
| BULK-02 | Invalid store returns error for that row | integration | `pytest tests/integration/test_business_prices.py::TestBulkUpdate::test_bulk_update_foreign_store_row_error` | No — Wave 0 |
| SVC-01 | Service approve_proposal logic unified | unit | `pytest tests/unit/test_products.py::test_approve_proposal_service` | No — Wave 0 |

### Sampling Rate
- **Per task commit:** `docker exec bargain-backend pytest tests/integration/test_proposal_admin.py tests/integration/test_business_prices.py -v --tb=short`
- **Per wave merge:** `make test-backend`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `backend/tests/integration/test_proposal_admin.py` — covers PRO-01, PRO-02, PRO-03, PRO-04
- [ ] `backend/apps/products/services.py` — covers SVC-01
- [ ] Additional test methods in `backend/tests/integration/test_business_prices.py` — covers BULK-01, BULK-02

## Sources

### Primary (HIGH confidence)
- Direct code inspection of `backend/apps/products/views.py` — approve/reject logic verified line by line
- Direct code inspection of `backend/apps/products/admin.py` — divergence found and documented
- Direct code inspection of `backend/apps/business/views.py` + `serializers.py` — bulk_update contract verified
- Direct code inspection of `frontend/web/src/pages/PricesPage.tsx` — CSV payload uses `product`/`store` int PKs
- Direct code inspection of `frontend/src/screens/home/ProductProposalScreen.tsx` — screen exists and wired
- Direct code inspection of `frontend/src/navigation/MainTabs.tsx` — ProductProposal screen is in navigator
- Direct code inspection of `backend/tests/integration/` — confirmed no test covers proposals/admin endpoint

### Secondary (MEDIUM confidence)
- Code pattern analysis of `backend/tests/conftest.py` and `factories.py` — fixtures available for new tests

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries, all existing code inspected
- Architecture: HIGH — extracted from direct code reading, not from training data
- Pitfalls: HIGH — derived from actual code divergences found between admin.py and views.py
- Test gaps: HIGH — confirmed by grep search that no test file references `proposals/admin`

**Research date:** 2026-04-05
**Valid until:** 2026-05-05 (stable domain, low churn)
