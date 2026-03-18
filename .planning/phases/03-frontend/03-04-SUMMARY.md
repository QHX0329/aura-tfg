---
phase: 03-frontend
plan: "04"
subsystem: frontend-home
tags: [react-native, expo, zustand, notifications, home-dashboard, tdd]
dependency_graph:
  requires: [03-01, 03-02, 03-03]
  provides: [HomeScreen-live-data, NotificationScreen]
  affects: [frontend/src/screens/home/, frontend/src/navigation/MainTabs.tsx]
tech_stack:
  added: []
  patterns:
    - expo-location for device GPS with __DEV__ fallback to Seville coords
    - SectionList with day-grouped notifications (Hoy/Ayer/Esta semana)
    - Swipeable right-actions for swipe-to-delete (react-native-gesture-handler)
    - ListHeaderComponent pattern for testable header buttons
key_files:
  created:
    - frontend/src/screens/home/NotificationScreen.tsx
    - frontend/__tests__/NotificationScreen.test.tsx
  modified:
    - frontend/src/screens/home/HomeScreen.tsx
    - frontend/src/navigation/MainTabs.tsx
decisions:
  - HomeScreen always re-fetches lists on mount and refresh (no empty-guard) for data freshness
  - mark-all-read button rendered as ListHeaderComponent in addition to navigation.setOptions for test accessibility
  - Swipeable mock in tests renders both children and renderRightActions() so delete buttons are accessible
  - loadAll() fetches all 4 sources in parallel (lists, notifications, alerts, stores) on every mount
  - __DEV__ flag used to skip real GPS call in development and use Seville center coords instead
metrics:
  duration_seconds: 546
  completed_date: "2026-03-18"
  tasks_completed: 2
  files_modified: 4
---

# Phase 3 Plan 4: HomeScreen Live Dashboard + NotificationScreen Summary

**One-liner:** HomeScreen replaces all MOCK_* data with 4 live API widgets (lists/stores/alerts/notifications) + new NotificationScreen inbox with day grouping, swipe-delete and mark-all-read.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| RED  | TDD: failing tests for HomeScreen + NotificationScreen | 50e288e | `__tests__/NotificationScreen.test.tsx` |
| 1    | HomeScreen — replace all MOCK data with live API widgets | 3197d3c | `HomeScreen.tsx`, `MainTabs.tsx` |
| 2    | NotificationScreen — full inbox with grouping, swipe-delete, mark-all-read | 3197d3c | `NotificationScreen.tsx`, `MainTabs.tsx` |

## Verification Results

- `npx jest __tests__/NotificationScreen.test.tsx` — 11/11 PASS
- `npx jest App.test.tsx` — 1/1 PASS (smoke)
- `npx eslint src/screens/home/ --max-warnings 0` — 0 errors, 0 warnings
- `grep MOCK_ HomeScreen.tsx` — no matches (all mock data removed)

## Decisions Made

1. **No fetch guard on loadAll**: HomeScreen always fetches lists on mount (not just when empty) for fresh data on every visit. Consistent with pull-to-refresh behavior.

2. **ListHeaderComponent for mark-all-read**: The `mark-all-read-btn` testID is rendered as `ListHeaderComponent` in the SectionList, not only in `navigation.setOptions`. This makes it accessible in RNTL tests without needing to mock the nav header renderer.

3. **Swipeable mock renders right actions**: Updated the jest mock for `react-native-gesture-handler`'s `Swipeable` to call `renderRightActions()` and render the result. This allows tests to `getByTestId("delete-notification-{id}")`.

4. **__DEV__ GPS fallback**: In development, `loadAll` uses hardcoded Seville coordinates (37.3886, -5.9823) instead of calling `getCurrentPositionAsync`, avoiding device/emulator GPS dependency in dev.

5. **HomeScreen navigation via `useNavigation` hook**: The `useNavigation<NativeStackNavigationProp<HomeStackParamList>>()` hook is used at component level — no prop drilling needed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `require()` import replaced with proper ES import**
- **Found during:** Task 1 ESLint check
- **Issue:** Original draft used `require("@react-navigation/native")` inline inside component, triggering `@typescript-eslint/no-require-imports` warning
- **Fix:** Added `import { useNavigation } from "@react-navigation/native"` at module level
- **Files modified:** `HomeScreen.tsx`
- **Commit:** 3197d3c

**2. [Rule 1 - Bug] `handleMarkAllRead` referenced before definition in `useEffect`**
- **Found during:** Task 2 ESLint check
- **Issue:** `useEffect` for `navigation.setOptions` referenced `handleMarkAllRead` which was defined after it, causing a `react-hooks/exhaustive-deps` warning (missing dep)
- **Fix:** Reordered `handleMarkAllRead` definition before the `useEffect`, added it to dependency array
- **Files modified:** `NotificationScreen.tsx`
- **Commit:** 3197d3c

**3. [Rule 2 - Missing] Unused `CHAIN_COLORS` and `StoreChain` type removed**
- **Found during:** Task 1 ESLint check
- **Issue:** `CHAIN_COLORS` constant and `StoreChain` type import carried over from old MOCK-era code but no longer used after removing `NearbyStoreCard` sub-component
- **Fix:** Removed unused constant and updated import
- **Files modified:** `HomeScreen.tsx`
- **Commit:** 3197d3c

## Self-Check: PASSED

All created files found on disk. All commits verified in git log.
