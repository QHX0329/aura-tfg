# Phase 6 UAT Checklist

**Phase:** 06-portal-business-app-movil
**Date:** 2026-04-05
**Status:** PASSED

## Backend Tests

- [x] `pytest tests/integration/test_proposal_admin.py` - 6/6 passed
  - [x] test_approve_proposal_creates_product_and_price
  - [x] test_approve_proposal_idempotent_barcode
  - [x] test_approve_proposal_without_price_no_price_created
  - [x] test_reject_proposal_with_reason
  - [x] test_non_admin_cannot_approve
  - [x] test_approve_already_approved_returns_400
- [x] `pytest tests/integration/test_bulk_prices.py` - 5/5 passed
  - [x] test_bulk_update_valid_rows
  - [x] test_bulk_update_invalid_product_id
  - [x] test_bulk_update_store_not_owned
  - [x] test_bulk_update_missing_required_field
  - [x] test_bulk_update_requires_verified_profile
- [x] `make test-backend` - full suite green

## Service Extraction Verification

- [x] `backend/apps/products/services.py` exists with `approve_proposal()`
- [x] `backend/apps/products/views.py` imports and calls `approve_proposal` from services
- [x] `backend/apps/products/admin.py` imports and calls `approve_proposal` from services
- [x] No duplicated approval logic remains
- [x] `source=CROWDSOURCING` is used everywhere for proposal approval materialization

## Frontend Verification

- [x] `ProductProposalScreen.tsx` form submission matches the API contract
- [x] `AdminApprovalPage.tsx` approve/reject calls use the correct endpoint paths
- [x] `PricesPage.tsx` CSV import sends the expected field names (`product`, `store`, `price`)
- [x] TypeScript compilation was checked; preexisting `src/navigation/MainTabs.tsx` overload errors remain as a baseline issue unrelated to this phase

## End-to-End Flows

- [x] Mobile: Create proposal with price+store
- [x] Admin: Approve proposal -> Product + Price created
- [x] Admin: Reject proposal with reason
- [x] Business: CSV import creates/updates prices

## Known Issues / Deferred to F7

- `window.location.reload()` in `ProductsUploadPage.tsx` is still a UX smell, but it does not block the phase
- AdminApprovalPage client-side filter for unverified profiles is a minor inefficiency
- Notification on proposal approval is not implemented
- TypeScript `MainTabs.tsx` errors are preexisting and remain outside this phase scope
