# Architecture

**Analysis Date:** 2026-03-16

## Pattern Overview

**Overall:** Layered 3-tier architecture with domain-driven design.

**Key Characteristics:**
- Django REST Framework backend with modular domain apps
- React Native + Expo frontend with centralized state management (Zustand)
- Domain separation by feature (users, products, stores, prices, shopping_lists, optimizer, OCR, assistant, business, notifications)
- JWT authentication with role-based access control (consumer, business, admin)
- PostGIS for geospatial operations (store locations, route calculations)
- Async task processing with Celery + Redis
- Structured logging with structlog
- Global exception handling with standardized error responses

## Layers

**Presentation Layer (Frontend):**
- Purpose: Mobile-first UI rendered with React Native, web fallback with React
- Location: `frontend/`
- Contains: Screens (auth, home, lists, map, profile), reusable UI components, navigation logic
- Depends on: HTTP client (`api/client.ts`), Zustand stores, theme system, type definitions
- Used by: End users, accessed via Expo CLI or built app

**API Gateway / HTTP Layer:**
- Purpose: Bridge between frontend and backend
- Location: `frontend/src/api/client.ts`
- Contains: Axios client with JWT interceptors, request/response handling
- Depends on: Auth store for token injection, backend at `http://localhost:8000/api/v1`
- Used by: All frontend services and screen components

**State Management Layer:**
- Purpose: Global state for authentication and app-wide concerns
- Location: `frontend/src/store/authStore.ts`
- Contains: Zustand store with user identity, JWT token, login/logout actions
- Depends on: Nothing (isolated)
- Used by: Navigation logic (RootNavigator), HTTP client interceptors, all screens

**REST API Layer (Backend):**
- Purpose: HTTP API implementing Django REST Framework with OpenAPI documentation
- Location: `backend/config/urls.py` routes to `backend/apps/*/urls.py`
- Contains: ViewSets, serializers, endpoints organized by domain
- Depends on: Django ORM, DRF, JWT authentication, permission classes
- Used by: Frontend HTTP client, external integrations

**Domain Applications Layer:**
- Purpose: Isolated business logic per feature domain
- Location: `backend/apps/{users,products,stores,prices,shopping_lists,optimizer,ocr,assistant,business,notifications}/`
- Contains: Per-app models, views, serializers, permissions, URL routing, tasks
- Depends on: Django models, DRF, core exceptions and permissions
- Used by: Other domain apps (through database or direct service calls), API layer

**Core Services Layer:**
- Purpose: Shared infrastructure and utilities
- Location: `backend/apps/core/`
- Contains: Health checks, global exception handler, role-based permissions, custom exceptions
- Depends on: Django, DRF
- Used by: All domain applications

**Database Layer:**
- Purpose: Data persistence with relational + geospatial support
- Location: PostgreSQL 16 + PostGIS 3.4 (configured in `backend/config/settings/base.py`)
- Contains: User model with location field, product catalog, store locations, prices, shopping lists, optimization results
- Depends on: Django ORM with GIS extensions
- Used by: All domain applications

**Async Task Layer:**
- Purpose: Background job processing (web scraping, price expiration, notifications)
- Location: `backend/apps/{prices,scraping,notifications}/tasks.py` + Celery broker (Redis)
- Contains: Celery tasks with `@shared_task` decorator
- Depends on: Celery, Redis, domain models
- Used by: Scheduled tasks (beat), triggered by domain events or API requests

**Configuration Layer:**
- Purpose: Environment-specific settings and initialization
- Location: `backend/config/settings/{base,dev,prod,test}.py`
- Contains: Django apps list, middleware, databases, auth backends, third-party config, logging
- Depends on: Environment variables via `.env`
- Used by: Django application bootstrap

## Data Flow

**Authentication Flow:**

1. User submits email + password on LoginScreen (`frontend/src/screens/auth/LoginScreen.tsx`)
2. Frontend calls POST `/api/v1/auth/login` via `apiClient` (Axios)
3. Backend endpoint processes credentials against User model (PostGIS-enabled)
4. Backend returns `{ access: "JWT_TOKEN", refresh: "REFRESH_TOKEN", user: {...} }`
5. Frontend intercepts response, calls `useAuthStore.login(token, user)`
6. Zustand store updates `isAuthenticated=true`, persists token in memory
7. RootNavigator reacts to `isAuthenticated` state change, shows MainTabs instead of AuthNavigator
8. Subsequent requests auto-inject token via `apiClient.interceptors.request` (line 32-41, `frontend/src/api/client.ts`)
9. If 401 response, `apiClient.interceptors.response` (line 48-57) calls `logout()` to reset app state

**Product Search & Optimization Flow:**

1. User creates ShoppingList with products on ListsScreen
2. Frontend calls POST `/api/v1/lists/` with `{ name, items: [...] }`
3. Backend creates ShoppingList + ShoppingListItem records
4. User requests optimization (route calculation) on MapScreen
5. Frontend calls POST `/api/v1/optimize/` with `{ shopping_list_id, user_location, max_distance_km, optimization_mode }`
6. Backend optimizer app:
   a. Queries prices for all products within radius via PostGIS
   b. Groups prices by store + calculates travel distance/time
   c. Runs weighted scoring algorithm: `score = w_price * savings - w_distance * extra_km - w_time * extra_min`
   d. Returns top-3 routes with store ordering + cost breakdown
7. Frontend receives OptimizationResult with route_data (GeoJSON)
8. MapScreen renders stores + route polyline using React Native Maps + Google Maps API

**Async Task Flow (Price Expiration):**

1. Celery Beat scheduler triggers `expire_stale_prices` task every 6 hours (configured in `backend/config/celery.py`)
2. Task queries all Price records with `source='scraping'` and `verified_at < now()-48h`
3. Marks expired prices as `is_active=false` (or deletes, TBD in model implementation)
4. Logs results to structlog + sends to monitoring backend
5. Next price query automatically filters out expired prices

**State Management:**

- Frontend global state: Only AuthStore with user identity + token (minimal, edge-case values)
- Backend state: Django ORM handles all domain state (users, products, stores, prices, lists)
- Frontend local state: Screen components use React hooks for form inputs, UI toggles (not persisted)
- Real-time state: Not yet implemented; frontend polls backend for list updates
- Error state: Captured in responses via global exception handler (`backend/apps/core/exceptions.py`)

## Key Abstractions

**User Model (AbstractUser extension):**
- Purpose: Extended Django auth with roles, location, preferences
- Examples: `backend/apps/users/models.py`
- Pattern: Model inheritance + property methods for role checks (`is_consumer`, `is_business`)

**ViewSet Pattern:**
- Purpose: DRF ViewSet pattern for CRUD + custom actions per domain
- Examples: All `backend/apps/*/urls.py` reference ViewSets (not yet fully defined)
- Pattern: ModelViewSet + custom actions (e.g., `POST /api/v1/optimize/` for optimization)

**Permission Classes:**
- Purpose: Fine-grained access control decorators
- Examples: `backend/apps/core/permissions.py` (IsConsumer, IsBusiness, IsOwnerOrAdmin)
- Pattern: BasePermission subclasses with `has_permission()` and `has_object_permission()` methods

**Exception Handler:**
- Purpose: Standardized error response format across all endpoints
- Examples: `backend/apps/core/exceptions.py` + handler registered in settings
- Pattern: Custom exceptions inherit BargainAPIException, mapped to HTTP status codes

**Zustand Store Pattern:**
- Purpose: Minimal global state for auth + app-wide concerns
- Examples: `frontend/src/store/authStore.ts`
- Pattern: `create<State>((set) => ({...}))` with immer middleware for immutability

**Component Composition (React Native):**
- Purpose: Reusable, typed component system
- Examples: `frontend/src/components/ui/ProductCard.tsx` with vertical/horizontal variants
- Pattern: Functional components with TypeScript interfaces, Reanimated 2 for animations, StyleSheet for styling

**Navigation Stack Pattern:**
- Purpose: TypeScript-safe navigation with screen params
- Examples: `frontend/src/navigation/RootNavigator.tsx`, `MainTabs.tsx`
- Pattern: createNativeStackNavigator<ParamList> with conditional rendering based on auth state

**Celery Task Pattern:**
- Purpose: Async background jobs for long-running operations
- Examples: `backend/apps/prices/tasks.py`, `backend/apps/scraping/tasks.py`
- Pattern: `@shared_task(bind=True)` with logging, retries on failure

**Domain App Structure:**
- Purpose: Self-contained feature modules with clear dependencies
- Examples: `/backend/apps/{products,stores,prices}/`
- Pattern: Per-app `models.py`, `views.py`, `serializers.py` (to be added), `urls.py`, `migrations/`

## Entry Points

**Backend:**
- Location: `backend/manage.py`
- Triggers: Django CLI; typically `python manage.py runserver` (dev) or `gunicorn config.wsgi` (prod)
- Responsibilities: Database initialization, app bootstrap, middleware setup, route registration via `backend/config/urls.py`

**Frontend:**
- Location: `frontend/App.tsx`
- Triggers: `npx expo start` (local) or compiled native app
- Responsibilities: Font loading, NavigationContainer initialization, RootNavigator rendering

**API Entry Points (by domain):**
- `api/health/` → Health check without auth (from `backend/apps/core/urls.py`)
- `api/v1/auth/` → Login, register, token refresh (from `backend/apps/users/urls.py`)
- `api/v1/products/` → Product CRUD (from `backend/apps/products/urls.py`)
- `api/v1/stores/` → Store search + geolocation (from `backend/apps/stores/urls.py`)
- `api/v1/prices/` → Price queries by product/store (from `backend/apps/prices/urls.py`)
- `api/v1/lists/` → Shopping list CRUD (from `backend/apps/shopping_lists/urls.py`)
- `api/v1/optimize/` → Route optimization algorithm (from `backend/apps/optimizer/urls.py`)
- `api/v1/ocr/` → Image text extraction (from `backend/apps/ocr/urls.py`)
- `api/v1/assistant/` → LLM chat endpoint (from `backend/apps/assistant/urls.py`)
- `api/v1/business/` → SME portal endpoints (from `backend/apps/business/urls.py`)
- `api/v1/notifications/` → Push + email notification management (from `backend/apps/notifications/urls.py`)

## Error Handling

**Strategy:** Standardized JSON error responses with codes + HTTP status codes.

**Patterns:**
- Custom exceptions in `backend/apps/core/exceptions.py` inherit `BargainAPIException`
- Global exception handler `bargain_exception_handler()` wraps all responses
- Response format: `{ success: false, error: { code: "ERROR_CODE", message: "...", details: {...} } }`
- HTTP status codes map to business errors (404 for not found, 409 for conflict, 422 for validation, 429 for rate limit)
- Frontend intercepts 401 to trigger logout via `apiClient.interceptors.response`
- Logging via `structlog` for monitoring + Sentry integration (configured but not yet in code)

**Common Exceptions:**
- `StoreNotFoundError` (404) — No stores in search radius
- `ProductNotFoundError` (404) — Product not in catalog
- `PriceExpiredError` (409) — Price data is stale
- `OptimizationError` (422) — Algorithm cannot compute valid route
- `OCRProcessingError` (422) — Image text extraction failed
- `AssistantError` (503) — LLM unavailable
- `RateLimitExceededError` (429) — Too many requests

## Cross-Cutting Concerns

**Logging:** Structured logging with `structlog`; configuration in `backend/config/settings/base.py`

**Validation:** Django model validators + DRF serializer validation (to be implemented per app)

**Authentication:** JWT via `rest_framework_simplejwt`; middleware in settings registers JWTAuthentication

**Authorization:** Role-based permission classes (IsConsumer, IsBusiness, IsBusinessOwnerOrAdmin) applied per endpoint

**CORS:** Configured in `backend/config/settings/base.py` for frontend origin

**Rate Limiting:** Not yet implemented (RateLimitExceededError exists for future use)

**Geolocation:** PostGIS integration for store searches and route distance calculations

---

*Architecture analysis: 2026-03-16*
