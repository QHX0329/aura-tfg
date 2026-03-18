---
phase: 03-frontend
plan: "01"
subsystem: ui
tags: [axios, jwt, zustand, react-native, expo, reanimated, expo-secure-store, expo-location, react-native-maps]

# Dependency graph
requires:
  - phase: 02-business-notifications
    provides: Backend API endpoints (auth, lists, notifications, prices, stores)

provides:
  - Axios HTTP client with JWT refresh-and-retry queue (single refresh per concurrent 401 burst)
  - Response interceptor that unwraps { success, data } backend shape
  - authStore with refreshToken field, hydrate() action, and SecureStore persistence
  - 6 typed API service modules (authService, listService, productService, storeService, notificationService, priceService)
  - listStore, notificationStore, profileStore Zustand stores
  - SkeletonBox animated loading placeholder (Reanimated withRepeat opacity pulse)
  - Extended navigation types (Notifications, PriceAlerts, ChangePassword routes)
  - Notification, PriceAlert, UserPreferences domain interfaces

affects:
  - 03-02 (screens use these service modules and stores)
  - 03-03 (map screen uses storeService + expo-location)
  - 03-04 (notifications screen uses notificationStore + notificationService)
  - 03-05 (profile screen uses profileStore + authService)

# Tech tracking
tech-stack:
  added:
    - expo-location ~55.1.3 (geolocation permissions + location API)
    - react-native-maps 1.27.2 (map rendering)
    - react-native-gesture-handler ~2.30.0 (gesture support for navigation)
  patterns:
    - API services are thin typed wrappers over apiClient; screens never call apiClient directly
    - Zustand 5 without persist middleware; manual hydration via hydrate() called on app mount
    - JWT refresh queue pattern: isRefreshing flag + callback array prevents concurrent refresh storms
    - SkeletonBox as generic animated placeholder for all loading states

key-files:
  created:
    - frontend/src/api/authService.ts
    - frontend/src/api/listService.ts
    - frontend/src/api/productService.ts
    - frontend/src/api/storeService.ts
    - frontend/src/api/notificationService.ts
    - frontend/src/api/priceService.ts
    - frontend/src/store/listStore.ts
    - frontend/src/store/notificationStore.ts
    - frontend/src/store/profileStore.ts
    - frontend/src/components/ui/SkeletonBox.tsx
    - frontend/__tests__/apiClient.test.ts
    - frontend/__tests__/SkeletonBox.test.tsx
  modified:
    - frontend/src/api/client.ts (refresh queue interceptor)
    - frontend/src/store/authStore.ts (refreshToken, hydrate, async login/logout)
    - frontend/src/components/ui/index.ts (SkeletonBox export)
    - frontend/src/navigation/types.ts (Notifications, PriceAlerts, ChangePassword)
    - frontend/src/types/domain.ts (Notification, PriceAlert, UserPreferences)
    - frontend/app.json (expo-location plugin + Android Google Maps key)
    - frontend/package.json (expo-location, react-native-maps, react-native-gesture-handler)

key-decisions:
  - "Zustand 5 does not support built-in persist middleware with expo-secure-store — manual hydration via hydrate() on app mount"
  - "Refresh token endpoint uses a separate axios.create() instance (refreshAxios) to avoid interceptor recursion"
  - "Response interceptor unwraps {success, data} only when success field is defined; JWT flat responses pass through unchanged"
  - "notificationStore.unreadCount is derived state, recalculated on every mutation (not stored independently)"

patterns-established:
  - "API layer: one service file per domain; all functions typed; no direct apiClient calls from screens"
  - "Zustand stores: state + actions in one create() call, no middleware; async actions call expo-secure-store directly"
  - "TDD: test scaffold (RED) committed as test() commit, then implementation (GREEN) committed as feat() commit"

requirements-completed:
  - NFR-03

# Metrics
duration: 9min
completed: 2026-03-18
---

# Phase 03 Plan 01: Frontend Foundation Summary

**Axios JWT refresh-and-retry queue, 6 typed API services, 4 Zustand stores (auth/list/notifications/profile), and SkeletonBox animation — complete frontend data layer foundation**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-18T07:56:11Z
- **Completed:** 2026-03-18T08:05:00Z
- **Tasks:** 2
- **Files modified:** 19

## Accomplishments

- Upgraded Axios client with full JWT refresh-and-retry queue: concurrent 401s queue so only one refresh call is made, original requests retry automatically with new token
- authStore upgraded with `refreshToken` field, async `login()`/`logout()` persisting to expo-secure-store, and `hydrate()` to restore session on app restart
- Created 6 typed API service modules covering auth, lists, products, stores, notifications, and prices — screens can now consume real API data
- Created 3 new Zustand stores: listStore (lists + active list), notificationStore (with derived unreadCount), profileStore (profile + preferences)
- SkeletonBox component uses Reanimated `withRepeat` for infinite opacity pulse (1 → 0.3 → 1, 800ms, easing)
- Installed expo-location, react-native-maps, react-native-gesture-handler and updated app.json with Spanish location permission string

## Task Commits

Each task was committed atomically:

1. **Task 1: Install packages, upgrade Axios client, and extend authStore** - `fdacf47` (feat)
2. **Task 2: API services, Zustand stores, SkeletonBox, nav types** - `28b881c` (feat)

## Files Created/Modified

- `frontend/src/api/client.ts` — Upgraded with refresh queue (isRefreshing + callback array), response unwrapper
- `frontend/src/store/authStore.ts` — Added refreshToken, memberSince, hydrate(), async login/logout with SecureStore
- `frontend/src/api/authService.ts` — login, register, getProfile, updateProfile, updatePreferences, changePassword, requestPasswordReset
- `frontend/src/api/listService.ts` — CRUD for lists and items
- `frontend/src/api/productService.ts` — search, autocomplete
- `frontend/src/api/storeService.ts` — getNearby (lat/lng/radius)
- `frontend/src/api/notificationService.ts` — getNotifications, markAsRead, markAllAsRead, deleteNotification, registerPushToken
- `frontend/src/api/priceService.ts` — getPriceAlerts, getPriceComparison
- `frontend/src/store/listStore.ts` — lists array, activeList, setLists, addList, removeList, updateListItem
- `frontend/src/store/notificationStore.ts` — notifications, unreadCount, markRead, markAllRead, removeNotification, pagination
- `frontend/src/store/profileStore.ts` — profile, updatePreferences (maps snake_case backend prefs to camelCase UserProfile)
- `frontend/src/components/ui/SkeletonBox.tsx` — Animated Reanimated placeholder
- `frontend/src/components/ui/index.ts` — Added SkeletonBox export
- `frontend/src/navigation/types.ts` — Added Notifications, PriceAlerts, ChangePassword routes
- `frontend/src/types/domain.ts` — Added Notification, PriceAlert, UserPreferences interfaces
- `frontend/app.json` — expo-location plugin + Android Google Maps API key placeholder
- `frontend/package.json` — expo-location, react-native-maps, react-native-gesture-handler
- `frontend/__tests__/apiClient.test.ts` — 8 tests for authStore + interceptor logic
- `frontend/__tests__/SkeletonBox.test.tsx` — 5 tests for SkeletonBox + listStore + notificationStore

## Decisions Made

- **Zustand 5 + SecureStore manual hydration**: Zustand 5 removed built-in persist middleware with async storage; used manual `hydrate()` action called in App.tsx on mount instead
- **Separate refreshAxios instance**: The token refresh POST uses a fresh `axios.create()` instance, not `apiClient`, to avoid the 401 interceptor catching itself in infinite recursion
- **Response unwrapping logic**: `if (response.data?.success !== undefined) return response.data.data; return response.data` — handles both backend standard shape and JWT flat responses
- **notificationStore unreadCount as derived state**: recalculated on every mutation via `countUnread()` helper rather than stored separately to avoid drift

## Deviations from Plan

**1. [Rule 2 - Missing Critical] Fixed ESLint Array type warning in client.ts**
- **Found during:** Task 2 (ESLint verification pass)
- **Issue:** `Array<(token: string) => void>` triggers `@typescript-eslint/array-type` warning
- **Fix:** Changed to `((token: string) => void)[]`
- **Files modified:** `frontend/src/api/client.ts`
- **Verification:** `npx eslint src/api/` reported 0 errors, 0 warnings
- **Committed in:** 28b881c (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 lint rule)
**Impact on plan:** Trivial style fix, no scope creep.

## Issues Encountered

- Jest mock for `expo-secure-store` needed explicit cast `(SecureStore.getItemAsync as jest.Mock)` because the module mock returns `jest.fn()` objects but TypeScript sees the real types — cast pattern applied consistently in test file.

## User Setup Required

None - no external service configuration required beyond what was already set up in Phase 2.

## Next Phase Readiness

- All data-access infrastructure is in place; Phase 3 Plan 02 can implement screens that call `listService`, `authService`, etc.
- `authStore.hydrate()` must be called in App.tsx on mount to restore session — this should be done in 03-02 (or whichever plan implements the root navigation flow)
- Google Maps API key (`EXPO_PUBLIC_GOOGLE_MAPS_KEY`) must be added to `.env` before map screen can render — tracked in existing blocker

## Self-Check: PASSED

All created files confirmed present on disk:
- frontend/src/api/authService.ts — FOUND
- frontend/src/api/listService.ts — FOUND
- frontend/src/api/productService.ts — FOUND
- frontend/src/api/storeService.ts — FOUND
- frontend/src/api/notificationService.ts — FOUND
- frontend/src/api/priceService.ts — FOUND
- frontend/src/store/listStore.ts — FOUND
- frontend/src/store/notificationStore.ts — FOUND
- frontend/src/store/profileStore.ts — FOUND
- frontend/src/components/ui/SkeletonBox.tsx — FOUND

All commits confirmed:
- fdacf47 (Task 1) — FOUND
- 28b881c (Task 2) — FOUND

---
*Phase: 03-frontend*
*Completed: 2026-03-18*
